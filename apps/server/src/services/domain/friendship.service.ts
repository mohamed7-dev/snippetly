import {
    CurrentUserFriendsListDtoType,
    CurrentUserInboxListDtoType,
    CurrentUserOutboxListDtoType,
    FriendshipStatus,
} from '@snippetly/common/dto';
import { Brackets, In, IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
import { InvalidFriendshipActionError } from '../../common/errors/generated-developer-errors';
import { OnApplicationBootstrap } from '../../common/types/lifecycle-hooks';
import { Developer } from '../../entities/developer/developer.entity';
import { Friendship } from '../../entities/friendships/friendship.entity';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { AppJobEvent } from '../../infra/event-bus/events/app-job.event';
import { FriendshipEvent } from '../../infra/event-bus/events/friendship.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { moduleRef } from '../../infra/ioc-container/module-ref';
import { JobQueue } from '../../infra/job-queue/job-qeueue.service';
import { AppJob } from '../../infra/job-queue/types';
import { PushNotificationService } from '../../infra/push-notification/push-notification.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { DeveloperService } from './developer.service';

type FriendshipSendInput = {
    requesterId: string;
    addresseeId: string;
    actorId: string;
};

type FriendshipActionInput = {
    requesterId: string;
    addresseeId: string;
    actorId: string;
};

type FriendshipActivity = {
    snippetsCount: number;
    recentSnippets: Array<{
        id: string;
        name: string;
        slug: string;
        language: string;
    }>;
};

type FriendshipWithRecentSnippets = Omit<Friendship, 'requester' | 'addressee'> & {
    requester: Developer & Partial<FriendshipActivity>;
    addressee: Developer & Partial<FriendshipActivity>;
};

@Injectable()
export class FriendshipService implements OnApplicationBootstrap {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly eventBus: EventBus,
        private readonly jobQueue: JobQueue,
        private readonly pushNotificationService: PushNotificationService,
    ) {}

    /** Resolves the developer service without creating a circular dependency. */
    private get developerService(): DeveloperService {
        const { DeveloperService } = require('./developer.service') as typeof import('./developer.service');
        return moduleRef.getProvider<DeveloperService>(DeveloperService);
    }

    /**
     * @description
     * Registers friendship notification handlers at application startup.
     * @internal
     */
    onApplicationBootstrap(): void {
        this.eventBus.ofType(FriendshipEvent).subscribe(event => {
            if (!isFriendshipNotificationType(event.type) || !event.input?.actorId) {
                return;
            }
            const job: AppJob = {
                type: 'notify-friendship-change',
                eventType: event.type,
                requesterId: event.input.requesterId,
                addresseeId: event.input.addresseeId,
                actorId: event.input.actorId,
            };
            void this.jobQueue.enqueue(job, 10);
        });
        this.eventBus.registerSyncHandler({
            event: AppJobEvent,
            id: 'friendship-service-job-handler',
            handler: async ({ job }) => {
                if (job.type === 'notify-friendship-change') {
                    await this.processFriendshipNotificationJob(job);
                }
            },
        });
    }

    /** Sends the push notification for a queued friendship event. */
    private async processFriendshipNotificationJob(
        job: Extract<AppJob, { type: 'notify-friendship-change' }>,
    ): Promise<void> {
        const recipientId =
            job.eventType === 'sent' || job.eventType === 'cancelled' ? job.addresseeId : job.requesterId;
        const actor = await this.databaseService.getRepository(Developer).findOne({
            where: { id: job.actorId, deletedAt: IsNull() },
        });
        if (!actor) return;

        const actorName = `${actor.firstName} ${actor.lastName}`.trim();

        const messages = {
            sent: {
                title: `${actorName} sent you a friend request`,
                body: 'Open your requests to respond.',
            },
            accepted: {
                title: `${actorName} accepted your friend request`,
                body: 'You are now friends.',
            },
            cancelled: {
                title: `${actorName} cancelled a friend request`,
                body: 'The request is no longer pending.',
            },
            rejected: {
                title: `${actorName} declined your friend request`,
                body: 'Your friend request was declined.',
            },
        } as const;
        const message = messages[job.eventType];
        await this.pushNotificationService.sendToDevelopers([recipientId], {
            ...message,
            tag: `friendship-${job.eventType}-${job.requesterId}-${job.addresseeId}`,
        });
    }

    /**
     * @description
     * Creates or updates a friendship record with the supplied status.
     *
     * :::info
     * it emits FriendshipEvent#created event
     * :::
     */
    public async create(
        ctx: RequestContext,
        input: Pick<FriendshipActionInput, 'addresseeId' | 'requesterId'> & { status: FriendshipStatus },
    ) {
        const existingFriendship = await this.findFriendshipBetween(
            ctx,
            input.requesterId,
            input.addresseeId,
        );

        const repo = this.databaseService.getRepository(ctx, Friendship);

        if (existingFriendship) {
            if (existingFriendship.status === FriendshipStatus.Pending) {
                return new InvalidFriendshipActionError({
                    reason: 'A pending friendship request already exists between these developers.',
                });
            }

            if (existingFriendship.status === FriendshipStatus.Accepted) {
                return new InvalidFriendshipActionError({
                    reason: 'This friendship has already been accepted.',
                });
            }

            existingFriendship.status = FriendshipStatus.Pending;
            existingFriendship.acceptedAt = null;
            existingFriendship.rejectedAt = null;
            existingFriendship.cancelledAt = null;

            return await repo.save(existingFriendship);
        }

        const friendshipSides = await this.getFriendshipSides(ctx, input);
        if (isApiError(friendshipSides)) return friendshipSides;

        const friendship = new Friendship({
            requester: friendshipSides.requester,
            addressee: friendshipSides.addressee,
            status: input.status,
            acceptedAt: new Date(),
            rejectedAt: null,
            cancelledAt: null,
        });

        await repo.save(friendship);
        await this.eventBus.publish(new FriendshipEvent(ctx, friendship, 'created', input));
        return friendship;
    }

    /**
     * @description
     * Sends a friendship request or reopens a previously closed request.
     *
     * :::info
     * it emits FriendshipEvent#sent event
     * :::
     */
    public async sendFriendshipRequest(
        ctx: RequestContext,
        input: FriendshipSendInput,
    ): Promise<Friendship | InvalidFriendshipActionError> {
        const assertionResult = this.assertNotSelfRequest(input.requesterId, input.addresseeId);
        if (isApiError(assertionResult)) return assertionResult;

        const existingFriendship = await this.findFriendshipBetween(
            ctx,
            input.requesterId,
            input.addresseeId,
        );

        if (existingFriendship) {
            if (existingFriendship.status === FriendshipStatus.Pending) {
                return new InvalidFriendshipActionError({
                    reason: 'A pending friendship request already exists between these developers.',
                });
            }

            if (existingFriendship.status === FriendshipStatus.Accepted) {
                return new InvalidFriendshipActionError({
                    reason: 'This friendship has already been accepted.',
                });
            }

            existingFriendship.status = FriendshipStatus.Pending;
            existingFriendship.acceptedAt = null;
            existingFriendship.rejectedAt = null;
            existingFriendship.cancelledAt = null;

            const updatedFriendship = await this.databaseService
                .getRepository(ctx, Friendship)
                .save(existingFriendship);
            await this.eventBus.publish(
                new FriendshipEvent(ctx, updatedFriendship, 'sent', {
                    ...input,
                    actorId: input.requesterId,
                }),
            );
            return updatedFriendship;
        }

        const friendshipSides = await this.getFriendshipSides(ctx, input);
        if (isApiError(friendshipSides)) return friendshipSides;

        const repo = this.databaseService.getRepository(ctx, Friendship);
        const friendship = new Friendship({
            requester: friendshipSides.requester,
            addressee: friendshipSides.addressee,
            status: FriendshipStatus.Pending,
            acceptedAt: null,
            rejectedAt: null,
            cancelledAt: null,
        });

        await repo.save(friendship);
        await this.eventBus.publish(new FriendshipEvent(ctx, friendship, 'sent', input));
        return friendship;
    }

    /**
     * @description
     * Accepts a pending request when the acting developer is its addressee.
     *
     * :::info
     * it emits FriendshipEvent#accepted event
     * :::
     */
    public async acceptFriendshipRequest(
        ctx: RequestContext,
        input: FriendshipActionInput,
    ): Promise<Friendship | InvalidFriendshipActionError> {
        const assertionResult = this.assertNotSelfRequest(input.requesterId, input.addresseeId);
        if (isApiError(assertionResult)) return assertionResult;

        const friendship = await this.findFriendshipBetween(ctx, input.requesterId, input.addresseeId);

        if (!friendship) {
            return new InvalidFriendshipActionError({
                reason: 'Cannot accept a friendship request that does not exist.',
            });
        }

        if (friendship.addressee.id !== input.actorId) {
            return new InvalidFriendshipActionError({
                reason: 'Only the addressee of a friendship request can accept it.',
            });
        }

        if (friendship.status !== FriendshipStatus.Pending) {
            return new InvalidFriendshipActionError({
                reason: 'Only a pending friendship request can be accepted.',
            });
        }

        friendship.status = FriendshipStatus.Accepted;
        friendship.acceptedAt = new Date();
        friendship.rejectedAt = null;
        friendship.cancelledAt = null;

        await this.databaseService.getRepository(ctx, Friendship).save(friendship);

        await this.eventBus.publish(new FriendshipEvent(ctx, friendship, 'accepted', input));

        return friendship;
    }

    /**
     * @description
     * Rejects a pending request when the acting developer is its addressee.
     *
     * :::info
     * it emits FriendshipEvent#rejected event
     * :::
     */
    public async rejectFriendshipRequest(
        ctx: RequestContext,
        input: FriendshipActionInput,
    ): Promise<Friendship | InvalidFriendshipActionError> {
        const assertionResult = this.assertNotSelfRequest(input.requesterId, input.addresseeId);
        if (isApiError(assertionResult)) return assertionResult;

        const friendship = await this.findFriendshipBetween(ctx, input.requesterId, input.addresseeId);

        if (!friendship) {
            return new InvalidFriendshipActionError({
                reason: 'Cannot reject a friendship request that does not exist.',
            });
        }

        if (friendship.addressee.id !== input.actorId) {
            return new InvalidFriendshipActionError({
                reason: 'Only the addressee of a friendship request can reject it.',
            });
        }

        if (friendship.status !== FriendshipStatus.Pending) {
            return new InvalidFriendshipActionError({
                reason: 'Only a pending friendship request can be rejected.',
            });
        }

        friendship.status = FriendshipStatus.Rejected;
        friendship.rejectedAt = new Date();
        friendship.cancelledAt = null;

        await this.databaseService.getRepository(ctx, Friendship).save(friendship);
        await this.eventBus.publish(new FriendshipEvent(ctx, friendship, 'rejected', input));
        return friendship;
    }

    /**
     * @description
     * Cancels a pending request when the acting developer is its requester.
     *
     * :::info
     * it emits FriendshipEvent#cancelled event
     * :::
     */
    public async cancelFriendshipRequest(
        ctx: RequestContext,
        input: FriendshipActionInput,
    ): Promise<Friendship | InvalidFriendshipActionError> {
        const assertionResult = this.assertNotSelfRequest(input.requesterId, input.addresseeId);
        if (isApiError(assertionResult)) return assertionResult;

        const friendship = await this.findFriendshipBetween(ctx, input.requesterId, input.addresseeId);

        if (!friendship) {
            return new InvalidFriendshipActionError({
                reason: 'Cannot cancel a friendship request that does not exist.',
            });
        }

        if (friendship.requester.id !== input.actorId) {
            return new InvalidFriendshipActionError({
                reason: 'Only the requester can cancel a pending friendship request.',
            });
        }

        if (friendship.status !== FriendshipStatus.Pending) {
            return new InvalidFriendshipActionError({
                reason: 'Only a pending friendship request can be cancelled.',
            });
        }

        friendship.status = FriendshipStatus.Cancelled;
        friendship.cancelledAt = new Date();
        friendship.acceptedAt = null;
        friendship.rejectedAt = null;

        await this.databaseService.getRepository(ctx, Friendship).save(friendship);
        await this.eventBus.publish(new FriendshipEvent(ctx, friendship, 'cancelled', input));
        return friendship;
    }

    /**
     * @description
     * Lists accepted friendships for the supplied developer and includes verified participants.
     */
    public async getUserFriends(
        ctx: RequestContext,
        developerId: string,
        input: CurrentUserFriendsListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input as any, {
            ctx,
            where: [
                { requester: { id: developerId, deletedAt: IsNull() }, status: FriendshipStatus.Accepted },
                { addressee: { id: developerId, deletedAt: IsNull() }, status: FriendshipStatus.Accepted },
            ],
            relations: {
                requester: { user: true },
                addressee: { user: true },
            },
            orderBy: {
                updatedAt: 'DESC',
            },
            customPropsMap: {
                friendFirstName:
                    'CASE WHEN {requester}.id = :friendDeveloperId THEN {addressee}.firstName ELSE {requester}.firstName END',
                friendLastName:
                    'CASE WHEN {requester}.id = :friendDeveloperId THEN {addressee}.lastName ELSE {requester}.lastName END',
                friendEmailAddress:
                    'CASE WHEN {requester}.id = :friendDeveloperId THEN {addressee}.emailAddress ELSE {requester}.emailAddress END',
                friendId:
                    'CASE WHEN {requester}.id = :friendDeveloperId THEN {addressee}.id ELSE {requester}.id END',
            },
        });
        qb.setParameter('friendDeveloperId', developerId);
        const [items, itemsCount] = await qb.getManyAndCount();

        return {
            items: items.map(item => ({
                ...item,
                requester: { ...item.requester, isVerified: item.requester.isVerified },
                addressee: { ...item.addressee, isVerified: item.addressee.isVerified },
            })),
            itemsCount,
        };
    }

    /**
     * @description
     * Lists pending requests addressed to the developer with verified participant data.
     */
    public async getCurrentUserInbox(
        ctx: RequestContext,
        developerId: string,
        input: CurrentUserInboxListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input as any, {
            ctx,
            where: {
                addressee: { id: developerId, deletedAt: IsNull() },
                status: FriendshipStatus.Pending,
            },
            relations: {
                requester: { user: true },
                addressee: { user: true },
            },
            orderBy: {
                createdAt: 'DESC',
            },
            customPropsMap: {
                requesterFirstName: 'requester.firstName',
                requesterLastName: 'requester.lastName',
                requesterId: 'requester.id',
            },
        });
        const [items, itemsCount] = await qb.getManyAndCount();
        return {
            items: items.map(item => ({
                ...item,
                requester: { ...item.requester, isVerified: item.requester.isVerified },
                addressee: { ...item.addressee, isVerified: item.addressee.isVerified },
            })),
            itemsCount,
        };
    }

    /**
     * @description
     * Lists pending requests sent by the developer with verified participant data.
     */
    public async getCurrentUserOutbox(
        ctx: RequestContext,
        developerId: string,
        input: CurrentUserOutboxListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input as any, {
            ctx,
            where: {
                requester: { id: developerId, deletedAt: IsNull() },
                status: FriendshipStatus.Pending,
            },
            relations: {
                requester: { user: true },
                addressee: { user: true },
            },
            orderBy: {
                createdAt: 'DESC',
            },
            customPropsMap: {
                addresseeFirstName: 'addressee.firstName',
                addresseeLastName: 'addressee.lastName',
                addresseeId: 'addressee.id',
            },
        });
        const [items, itemsCount] = await qb.getManyAndCount();
        return {
            items: items.map(item => ({
                ...item,
                requester: { ...item.requester, isVerified: item.requester.isVerified },
                addressee: { ...item.addressee, isVerified: item.addressee.isVerified },
            })),
            itemsCount,
        };
    }

    /**
     * @description
     * Adds each friend's public snippet count and up to three recent snippets.
     */
    public async attachRecentSnippetsToFriendships(
        ctx: RequestContext,
        activeDeveloper: Developer,
        friendships: Friendship[],
    ): Promise<FriendshipWithRecentSnippets[]> {
        if (!friendships.length) return [];
        const friendIds = friendships.map(friendship =>
            friendship.requester.id === activeDeveloper.id
                ? friendship.addressee.id
                : friendship.requester.id,
        );
        const snippetRepo = this.databaseService.getRepository(ctx, Snippet);
        const rankedSnippetsQuery = snippetRepo
            .createQueryBuilder('snippet')
            .innerJoin('snippet.creator', 'creator')
            .select('creator.id', 'developer_id')
            .addSelect('snippet.id', 'id')
            .addSelect('snippet.name', 'name')
            .addSelect('snippet.slug', 'slug')
            .addSelect('snippet.language', 'language')
            .addSelect('COUNT(snippet.id) OVER (PARTITION BY creator.id)', 'snippets_count')
            .addSelect(
                'ROW_NUMBER() OVER (PARTITION BY creator.id ORDER BY snippet.createdAt DESC, snippet.id DESC)',
                'row_number',
            )
            .where('creator.id IN (:...friendIds)', { friendIds })
            .andWhere('snippet.isPrivate = :isPrivate', { isPrivate: false })
            .andWhere('snippet.deletedAt IS NULL');

        const recentSnippets = await snippetRepo.manager
            .createQueryBuilder()
            .select('ranked.developer_id', 'developerId')
            .addSelect('ranked.id', 'id')
            .addSelect('ranked.name', 'name')
            .addSelect('ranked.slug', 'slug')
            .addSelect('ranked.language', 'language')
            .addSelect('ranked.snippets_count', 'snippetsCount')
            .from(`(${rankedSnippetsQuery.getQuery()})`, 'ranked')
            .where('ranked.row_number <= :recentSnippetLimit', { recentSnippetLimit: 3 })
            .setParameters(rankedSnippetsQuery.getParameters())
            .orderBy('ranked.developer_id', 'ASC')
            .addOrderBy('ranked.row_number', 'ASC')
            .getRawMany<{
                developerId: string;
                id: string;
                name: string;
                slug: string;
                language: string;
                snippetsCount: string;
            }>();

        const friendStats = new Map<
            string,
            {
                snippetsCount: number;
                recentSnippets: Array<{
                    id: string;
                    name: string;
                    slug: string;
                    language: string;
                }>;
            }
        >();

        for (const { developerId: friendId, snippetsCount, ...snippet } of recentSnippets) {
            const stats = friendStats.get(friendId) ?? {
                snippetsCount: Number(snippetsCount),
                recentSnippets: [],
            };
            stats.recentSnippets.push(snippet);
            friendStats.set(friendId, stats);
        }

        return friendships.map((friendship): FriendshipWithRecentSnippets => {
            const friendSide: 'requester' | 'addressee' =
                friendship.requester.id === activeDeveloper.id ? 'addressee' : 'requester';
            const friend = friendship[friendSide];
            const stats = friendStats.get(friend.id) ?? { snippetsCount: 0, recentSnippets: [] };
            const friendWithStats = { ...friend, isVerified: friend.isVerified, ...stats };

            return {
                ...friendship,
                requester: friendSide === 'requester' ? friendWithStats : friendship.requester,
                addressee: friendSide === 'addressee' ? friendWithStats : friendship.addressee,
            };
        });
    }

    /**
     * @description
     * Adds the current user's favourite status to both participants in each friendship.
     */
    public async attachFavouriteStatusToParticipants<
        TItem extends {
            requester: { id: string };
            addressee: { id: string };
        },
    >(ctx: RequestContext, friendships: TItem[]) {
        const participants = friendships.flatMap(({ requester, addressee }) => [requester, addressee]);
        const participantsWithStatus = await this.developerService.attachFavouriteStatusToDevelopersList(
            ctx,
            participants,
        );
        const statusByDeveloperId = new Map<string, boolean>();
        for (const { id, isFavouritedByCurrentUser } of participantsWithStatus) {
            statusByDeveloperId.set(id, isFavouritedByCurrentUser);
        }

        return friendships.map(item => ({
            ...item,
            requester: {
                ...item.requester,
                isFavouritedByCurrentUser: statusByDeveloperId.get(item.requester.id) ?? false,
            },
            addressee: {
                ...item.addressee,
                isFavouritedByCurrentUser: statusByDeveloperId.get(item.addressee.id) ?? false,
            },
        }));
    }

    /**
     * @description
     * Counts a developer's accepted friendships and pending requests.
     */
    public async countDeveloperFriendships(ctx: RequestContext, developerId: string) {
        const friendshipRepo = this.databaseService.getRepository(ctx, Friendship);

        const [friendsCount, friendsInboxCount, friendsOutboxCount] = await Promise.all([
            friendshipRepo.count({
                where: [
                    { requester: { id: developerId }, status: FriendshipStatus.Accepted },
                    { addressee: { id: developerId }, status: FriendshipStatus.Accepted },
                ],
            }),
            friendshipRepo.count({
                where: { addressee: { id: developerId }, status: FriendshipStatus.Pending },
            }),
            friendshipRepo.count({
                where: { requester: { id: developerId }, status: FriendshipStatus.Pending },
            }),
        ]);

        return { friendsCount, friendsInboxCount, friendsOutboxCount };
    }

    /**
     * @description
     * Gets friendship status for each developer relative to the active developer.
     */
    public async getFriendshipInfoWithActiveDeveloper(
        ctx: RequestContext,
        activeDeveloperId: string,
        developerIds: string[],
    ) {
        const friendshipInfoByDeveloper = new Map<
            string,
            { isFriendWithCurrentUser: boolean; friendshipStatus: FriendshipStatus }
        >();
        const friendships = await this.databaseService
            .getRepository(ctx, Friendship)
            .createQueryBuilder('friendship')
            .innerJoin('friendship.requester', 'requester')
            .innerJoin('friendship.addressee', 'addressee')
            .select(
                'CASE WHEN requester.id = :activeDeveloperId THEN addressee.id ELSE requester.id END',
                'developerId',
            )
            .addSelect('friendship.status', 'friendshipStatus')
            .where(
                new Brackets(query => {
                    query
                        .where('requester.id = :activeDeveloperId AND addressee.id IN (:...developerIds)', {
                            activeDeveloperId,
                            developerIds,
                        })
                        .orWhere('addressee.id = :activeDeveloperId AND requester.id IN (:...developerIds)', {
                            activeDeveloperId,
                            developerIds,
                        });
                }),
            )
            .getRawMany<{ developerId: string; friendshipStatus: FriendshipStatus }>();

        for (const { developerId, friendshipStatus } of friendships) {
            friendshipInfoByDeveloper.set(developerId, {
                isFriendWithCurrentUser: friendshipStatus === FriendshipStatus.Accepted,
                friendshipStatus,
            });
        }

        return friendshipInfoByDeveloper;
    }

    /** Finds a friendship record between two developers, regardless of direction. */
    private async findFriendshipBetween(
        ctx: RequestContext,
        requesterId: string,
        addresseeId: string,
    ): Promise<Friendship | null> {
        const repo = this.databaseService.getRepository(ctx, Friendship);

        return repo.findOne({
            where: [
                {
                    requester: { id: requesterId },
                    addressee: { id: addresseeId },
                },
                {
                    requester: { id: addresseeId },
                    addressee: { id: requesterId },
                },
            ],
            relations: {
                requester: true,
                addressee: true,
            },
        });
    }

    /** Loads both developers involved in a friendship request. */
    private async getFriendshipSides(
        ctx: RequestContext,
        input: Pick<FriendshipActionInput, 'addresseeId' | 'requesterId'>,
    ) {
        const developers = await this.databaseService.getRepository(ctx, Developer).find({
            where: {
                id: In([input.addresseeId, input.requesterId]),
            },
        });

        if (developers.length < 2) {
            return new InvalidFriendshipActionError({
                reason: 'Developers can not be located.',
            });
        }

        return {
            addressee: developers.find(d => d.id === input.addresseeId),
            requester: developers.find(d => d.id === input.requesterId),
        };
    }

    /** Rejects a friendship action where both sides refer to the same developer. */
    private assertNotSelfRequest(requesterId: string, addresseeId: string) {
        if (requesterId === addresseeId) {
            return new InvalidFriendshipActionError({
                reason: 'A developer cannot send a friendship request to themselves.',
            });
        }
    }
}

/** Returns whether a friendship event should trigger a push notification. */
function isFriendshipNotificationType(type: string): type is 'sent' | 'accepted' | 'cancelled' | 'rejected' {
    return type === 'sent' || type === 'accepted' || type === 'cancelled' || type === 'rejected';
}
