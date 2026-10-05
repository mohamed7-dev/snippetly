import {
    CurrentUserFriendsListDtoType,
    CurrentUserInboxListDtoType,
    CurrentUserOutboxListDtoType,
    FriendshipStatus,
} from '@snippetly/common/dto';
import { In } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
import { InvalidFriendshipActionError } from '../../common/errors/generated-developer-errors';
import { Developer } from '../../entities/developer/developer.entity';
import { Friendship } from '../../entities/friendships/friendship.entity';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { FriendshipEvent } from '../../infra/event-bus/events/friendship.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';

type FriendshipSendInput = {
    requesterId: string;
    addresseeId: string;
};

type FriendshipActionInput = {
    requesterId: string;
    addresseeId: string;
    actorId: string;
};

@Injectable()
export class FriendshipService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly eventBus: EventBus,
    ) {}

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

            return await this.databaseService.getRepository(ctx, Friendship).save(existingFriendship);
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

    // Note: the word Current here is misleading, it indicates that
    // the method operates on the current active developer
    // which is not the case because it operates on whatever `developerId` gets
    // passed to it
    public async getUserFriends(
        ctx: RequestContext,
        developerId: string,
        input: CurrentUserFriendsListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input as any, {
            ctx,
            where: [
                { requester: { id: developerId }, status: FriendshipStatus.Accepted },
                { addressee: { id: developerId }, status: FriendshipStatus.Accepted },
            ],
            relations: {
                requester: true,
                addressee: true,
            },
            orderBy: {
                updatedAt: 'DESC',
            },
        });
        const [items, itemsCount] = await qb.getManyAndCount();

        return { items, itemsCount };
    }

    public async enrichFriends(
        ctx: RequestContext,
        items: Friendship[],
        itemsCount: number,
        developerId: string,
    ) {
        const friendIds = items.map(friendship =>
            friendship.requester.id === developerId ? friendship.addressee.id : friendship.requester.id,
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

        const enrichedItems = items.map(friendship => {
            const friendSide = friendship.requester.id === developerId ? 'addressee' : 'requester';
            const friend = friendship[friendSide];
            const stats = friendStats.get(friend.id) ?? { snippetsCount: 0, recentSnippets: [] };

            return {
                ...friendship,
                [friendSide]: { ...friend, ...stats },
            };
        });

        return { items: enrichedItems, itemsCount };
    }

    public async getDeveloperProfileInfo(
        ctx: RequestContext,
        developerId: string,
        currentUserDeveloperId?: string,
    ) {
        const repo = this.databaseService.getRepository(ctx, Friendship);
        const friendCount = await repo.count({
            where: [
                { requester: { id: developerId }, status: FriendshipStatus.Accepted },
                { addressee: { id: developerId }, status: FriendshipStatus.Accepted },
            ],
        });
        const friendship =
            currentUserDeveloperId && currentUserDeveloperId !== developerId
                ? await this.findFriendshipBetween(ctx, developerId, currentUserDeveloperId)
                : null;

        return {
            friendCount,
            friendshipInfo: {
                isCurrentUserAFriend: friendship?.status === FriendshipStatus.Accepted,
                requestStatus: friendship?.status ?? null,
            },
        };
    }

    public async getCurrentUserInbox(
        ctx: RequestContext,
        developerId: string,
        input: CurrentUserInboxListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input as any, {
            ctx,
            where: {
                addressee: { id: developerId },
                status: FriendshipStatus.Pending,
            },
            relations: {
                requester: true,
                addressee: true,
            },
            orderBy: {
                createdAt: 'DESC',
            },
        });
        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    public async getCurrentUserOutbox(
        ctx: RequestContext,
        developerId: string,
        input: CurrentUserOutboxListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input as any, {
            ctx,
            where: {
                requester: { id: developerId },
                status: FriendshipStatus.Pending,
            },
            relations: {
                requester: true,
                addressee: true,
            },
            orderBy: {
                createdAt: 'DESC',
            },
        });
        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

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

    private assertNotSelfRequest(requesterId: string, addresseeId: string) {
        if (requesterId === addresseeId) {
            return new InvalidFriendshipActionError({
                reason: 'A developer cannot send a friendship request to themselves.',
            });
        }
    }
}
