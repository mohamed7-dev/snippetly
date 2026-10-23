import {
    CreateSnippetDtoType,
    DeleteSnippetDtoType,
    DeletionResponse,
    FilterGroupOperator,
    FindOneSnippetDtoType,
    ForkSnippetDtoType,
    FriendshipStatus,
    SnippetListDtoType,
    SuccessResponse,
    UpdateSnippetDtoType,
    UserFriendsSnippetsListDtoType,
} from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { Brackets, FindOptionsRelations, In, IsNull, Not } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { EntityNotFoundError } from '../../common/errors/errors';
import { OnApplicationBootstrap } from '../../common/types/lifecycle-hooks';
import { Collection } from '../../entities/collections/collection.entity';
import { Developer } from '../../entities/developer/developer.entity';
import { Friendship } from '../../entities/friendships/friendship.entity';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { AppJobEvent } from '../../infra/event-bus/events/app-job.event';
import { SnippetEvent } from '../../infra/event-bus/events/snippet.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { JobQueue } from '../../infra/job-queue/job-qeueue.service';
import { AppJob } from '../../infra/job-queue/types';
import { PushNotificationService } from '../../infra/push-notification/push-notification.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { normalizeDeveloperCounts } from '../helpers/normalize-developer-counts';
import { SlugValidator } from '../helpers/slug-validator.service';
import { CollectionService } from './collection.service';
import { DeveloperService } from './developer.service';
import { FavouriteService } from './favourite.service';
import { FriendshipService } from './friendship.service';
import { TagService } from './tag.service';

@Injectable()
export class SnippetService implements OnApplicationBootstrap {
    constructor(
        private readonly slugValidator: SlugValidator,
        private readonly developerService: DeveloperService,
        private readonly collectionService: CollectionService,
        private readonly databaseService: DatabaseService,
        private readonly tagService: TagService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly friendshipService: FriendshipService,
        private readonly eventBus: EventBus,
        private readonly favouriteService: FavouriteService,
        private readonly pushNotificationService: PushNotificationService,
        private readonly jobQueue: JobQueue,
    ) {}

    /**
     * @description
     * Registers handlers for queued snippet jobs and publication notifications.
     * @internal
     */
    onApplicationBootstrap(): void {
        this.eventBus.registerSyncHandler({
            event: AppJobEvent,
            id: 'snippet-service-job-handler',
            handler: async ({ job }) => {
                if (job.type === 'notify-friends-of-published-snippet') {
                    await this.processPublishedSnippetNotificationJob(job);
                }
            },
        });
        this.eventBus.ofType(SnippetEvent).subscribe(event => {
            if (event.type === 'created') {
                if (!event.entity) return undefined;
                const { isPrivate, id, creator } = event.entity;
                if (isPrivate !== true && creator) {
                    void this.jobQueue.enqueue(
                        {
                            type: 'notify-friends-of-published-snippet',
                            authorId: creator.id,
                            snippetId: id,
                        },
                        10,
                    );
                }
            }
        });
    }

    /**
     * @description
     * Notifies a snippet author's friends about a published snippet.
     * @internal
     */
    private async processPublishedSnippetNotificationJob(
        job: Extract<AppJob, { type: 'notify-friends-of-published-snippet' }>,
    ): Promise<void> {
        const snippet = await this.databaseService.getRepository(Snippet).findOne({
            where: {
                id: job.snippetId,
                creator: { id: job.authorId },
                isPrivate: false,
                deletedAt: IsNull(),
            },
            relations: { creator: true },
        });
        if (!snippet) return;

        const friendships = await this.databaseService.getRepository(Friendship).find({
            where: [
                { requester: { id: job.authorId }, status: FriendshipStatus.Accepted },
                { addressee: { id: job.authorId }, status: FriendshipStatus.Accepted },
            ],
            relations: { requester: true, addressee: true },
        });
        const friendIds = [
            ...new Set(
                friendships.map(friendship =>
                    friendship.requester.id === job.authorId
                        ? friendship.addressee.id
                        : friendship.requester.id,
                ),
            ),
        ];
        if (!friendIds.length) return;

        await this.pushNotificationService.sendToDevelopers(friendIds, {
            title: `${snippet.creator.firstName} ${snippet.creator.lastName}`.trim() + ' published a snippet',
            body: snippet.name,
            url: `/snippets/${snippet.id}`,
            tag: `snippet-${snippet.id}`,
        });
    }

    /**
     * @description
     * Finds a snippet by ID, applying visibility and deletion filters.
     */
    public async findOne(
        ctx: RequestContext,
        input: FindOneSnippetDtoType['input'],
        relations?: FindOptionsRelations<Snippet>,
        options?: { includePrivateSnippet?: boolean; includeSoftDeleted?: boolean },
    ) {
        const repo = this.databaseService.getRepository(ctx, Snippet);

        const snippet = await repo.findOne({
            where: {
                id: input.id,
                ...(options?.includeSoftDeleted ? {} : { deletedAt: IsNull() }),
                ...(options?.includePrivateSnippet ? {} : { isPrivate: false }),
            },
            relations,
        });

        if (!snippet) return undefined;
        return snippet;
    }

    /**
     * @description
     * Lists snippets matching the supplied filters and pagination options.
     */
    public async find(
        ctx: RequestContext,
        input: SnippetListDtoType['input'],
        relations?: FindOptionsRelations<Snippet>,
        options?: {
            includePrivateSnippetsForCreatorId?: string;
            includePrivateSnippets?: boolean;
            includeSoftDeleted?: boolean;
            onlySoftDeleted?: boolean;
        },
    ) {
        const qb = this.listQueryBuilder.build(Snippet, input as any, {
            ctx,
            customPropsMap: {
                creatorFirstName: 'creator.firstName',
                creatorLastName: 'creator.lastName',
                collectionName: 'collection.name',
            },
            relations,
            alias: 's',
            where: {
                ...(options?.onlySoftDeleted
                    ? { deletedAt: Not(IsNull()) }
                    : options?.includeSoftDeleted
                      ? {}
                      : { deletedAt: IsNull() }),
                ...(options?.includePrivateSnippets ? {} : { isPrivate: false }),
            },
        });

        if (input.discover === true) {
            const activeDeveloper = await this.developerService.getActiveDeveloper(ctx);
            if (activeDeveloper) {
                qb.innerJoin('s.creator', 'discoverCreator').andWhere(
                    'discoverCreator.id <> :activeDeveloperId',
                    { activeDeveloperId: activeDeveloper.id },
                );
            }
        }

        const tagFilter = input.tags;
        const tagValues = tagFilter?.values;
        if (tagFilter && tagValues?.length) {
            const tagSubquery = qb.connection
                .createQueryBuilder()
                .select('snippet.id')
                .from(Snippet, 'snippet')
                .innerJoin('snippet.tags', 'tag')
                .where('tag.value IN (:...tagValues)')
                .setParameters({ tagValues });

            if ((tagFilter.operator ?? FilterGroupOperator.AND) === FilterGroupOperator.AND) {
                tagSubquery
                    .groupBy('snippet.id')
                    .having('COUNT(DISTINCT tag.id) = :tagCount', { tagCount: tagValues.length });
            }

            qb.andWhere(`s.id IN (${tagSubquery.getQuery()})`).setParameters(tagSubquery.getParameters());
        }

        if (input.collection) {
            qb.innerJoin('s.collection', 'collection');
            qb.andWhere('collection.id = :collectionId', {
                collectionId: input.collection,
            });
        }

        if (options?.includePrivateSnippetsForCreatorId) {
            qb.innerJoin('s.creator', 'collectionSnippetCreator');
            qb.andWhere(
                new Brackets(where =>
                    where
                        .where('s.isPrivate = :collectionSnippetIsPublic', {
                            collectionSnippetIsPublic: false,
                        })
                        .orWhere('collectionSnippetCreator.id = :collectionSnippetCreatorId', {
                            collectionSnippetCreatorId: options.includePrivateSnippetsForCreatorId,
                        }),
                ),
            );
        }

        if (input.creator) {
            qb.innerJoin('s.creator', 'creator');
            qb.andWhere('creator.id = :creatorId', {
                creatorId: input.creator,
            });
        }

        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    /**
     * @description
     * Lists public snippets published by the specified developer's friends.
     */
    public async getUserFriendsSnippets(
        ctx: RequestContext,
        developerId: string,
        input: UserFriendsSnippetsListDtoType['input'],
    ) {
        const friendships = await this.friendshipService.getUserFriends(ctx, developerId, {});

        if (!friendships.items.length) {
            return { items: [], itemsCount: 0 };
        }

        const friendIds = friendships.items.map(friendship =>
            friendship.requester.id === developerId ? friendship.addressee.id : friendship.requester.id,
        );

        const qb = this.listQueryBuilder.build(Snippet, input as any, {
            ctx,
            where: {
                creator: { id: In(friendIds) },
                isPrivate: false,
                deletedAt: IsNull(),
            },
            relations: {
                creator: { user: true },
                collection: true,
                tags: true,
                forkedFrom: {
                    creator: { user: true },
                },
            },
            orderBy: {
                createdAt: 'DESC',
            },
        });

        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    /**
     * @description
     * Creates a snippet for the active developer.
     *
     * :::info
     * it emits SnippetEvent#created event
     * :::
     */
    public async create(ctx: RequestContext, input: CreateSnippetDtoType['input']) {
        // resolve developer from current active user
        const developer = await this.developerService.getActiveDeveloper(ctx, true);

        await this.slugValidator.validateSlug(ctx, input, Snippet);

        const snippet = new Snippet({
            name: input.name,
            slug: input.slug,
            code: input.code,
            language: input.language,
            description: !input.description?.length ? null : input.description,
            note: !input.note?.length ? null : input.note,
            allowForking: input.allowForking,
            isPrivate: input.isPrivate,
            creator: developer,
        });

        // validate collection
        if (input.collectionId) {
            const collection = await this.collectionService.findOne(
                ctx,
                { id: input.collectionId },
                undefined,
                { includePrivateCollection: true, includeSoftDeleted: false },
            );
            if (!collection) {
                throw new EntityNotFoundError({ entityName: 'Collection', entityId: input.collectionId });
            }
            snippet.collection = collection;
        }

        // handle tags relation
        if (input.tags) {
            snippet.tags = await this.tagService.createTagsFromValues(ctx, input.tags);
        }

        const repo = this.databaseService.getRepository(ctx, Snippet);

        await repo.save(snippet);
        await this.eventBus.publish(new SnippetEvent(ctx, snippet, 'created', input));

        return snippet;
    }

    /**
     * @description
     * Updates a snippet and its collection and tags.
     *
     * :::info
     * it emits SnippetEvent#updated event
     * :::
     */
    public async update(ctx: RequestContext, input: UpdateSnippetDtoType['input']) {
        await this.slugValidator.validateSlug(ctx, input, Snippet);

        const repo = this.databaseService.getRepository(ctx, Snippet);
        let snippet = await this.findOne(
            ctx,
            input,
            { creator: true, collection: true, tags: true },
            { includePrivateSnippet: true },
        );

        if (!snippet || (ctx.isAuthorizedAsOwnerOnly && snippet.creator.user.id !== ctx.activeUserId)) {
            throw new EntityNotFoundError({ entityName: 'Snippet', entityId: input.id });
        }

        const { collectionId, tags, ...snippetInput } = input;
        snippet = Object.assign(snippet, omit(snippetInput, ['id']));

        if (collectionId) {
            const collection = await this.collectionService.findOne(ctx, { id: collectionId }, undefined, {
                includePrivateCollection: true,
                includeSoftDeleted: false,
            });
            if (!collection) {
                throw new EntityNotFoundError({ entityName: 'Collection', entityId: collectionId });
            }
            snippet.collection = collection;
        }

        if (tags) {
            snippet.tags = await this.tagService.createTagsFromValues(ctx, tags);
        }

        await this.eventBus.publish(new SnippetEvent(ctx, snippet, 'updated', input));

        await repo.save(snippet);

        return snippet;
    }

    /**
     * @description
     * Moves a snippet to the trash.
     *
     * :::info
     * it emits SnippetEvent#soft-deleted event
     * :::
     */
    public async softDelete(
        ctx: RequestContext,
        input: DeleteSnippetDtoType['input'],
    ): Promise<{ result: 'DELETED' | 'NOT_DELETED'; message: string }> {
        const repo = this.databaseService.getRepository(ctx, Snippet);
        const snippet = await this.findOne(
            ctx,
            { id: input.id },
            { creator: true },
            { includePrivateSnippet: true },
        );

        if (!snippet || (ctx.isAuthorizedAsOwnerOnly && snippet.creator.user.id !== ctx.activeUserId)) {
            return { result: 'NOT_DELETED', message: 'Snippet not found' };
        }

        snippet.deletedAt = new Date();
        await repo.save(snippet);
        await this.eventBus.publish(new SnippetEvent(ctx, snippet, 'soft-deleted', input));

        return { result: 'DELETED', message: '' };
    }

    /**
     * @description
     * Restores a snippet from the trash.
     *
     * :::info
     * it emits SnippetEvent#restored event
     * :::
     */
    public async restoreFromTrash(
        ctx: RequestContext,
        input: DeleteSnippetDtoType['input'],
    ): Promise<SuccessResponse> {
        const repo = this.databaseService.getRepository(ctx, Snippet);
        const snippet = await this.findOne(
            ctx,
            input,
            { creator: { user: true } },
            { includePrivateSnippet: true, includeSoftDeleted: true },
        );

        if (
            !snippet?.deletedAt ||
            (ctx.isAuthorizedAsOwnerOnly && snippet.creator.user.id !== ctx.activeUserId)
        ) {
            throw new EntityNotFoundError({ entityName: 'Snippet', entityId: input.id });
        }

        snippet.deletedAt = null;
        await repo.save(snippet);
        await this.eventBus.publish(new SnippetEvent(ctx, snippet, 'restored', input));
        return { success: true };
    }

    /**
     * @description
     * Permanently deletes a snippet from the trash.
     *
     * :::info
     * it emits SnippetEvent#deleted event
     * :::
     */
    public async permanentlyDeleteFromTrash(
        ctx: RequestContext,
        input: DeleteSnippetDtoType['input'],
    ): Promise<DeletionResponse> {
        const repo = this.databaseService.getRepository(ctx, Snippet);
        const snippet = await this.findOne(
            ctx,
            input,
            { creator: { user: true } },
            { includePrivateSnippet: true, includeSoftDeleted: true },
        );

        if (
            !snippet?.deletedAt ||
            (ctx.isAuthorizedAsOwnerOnly && snippet.creator.user.id !== ctx.activeUserId)
        ) {
            throw new EntityNotFoundError({ entityName: 'Snippet', entityId: input.id });
        }

        await repo.remove(snippet);
        await this.eventBus.publish(new SnippetEvent(ctx, snippet, 'deleted', input));
        return { result: 'DELETED', message: '' };
    }

    /**
     * @description
     * Forks an eligible snippet for the active developer.
     *
     * :::info
     * it emits SnippetEvent#forked event
     * :::
     */
    public async fork(ctx: RequestContext, input: ForkSnippetDtoType['input']) {
        const developer = await this.developerService.getActiveDeveloper(ctx, true);

        const repo = this.databaseService.getRepository(ctx, Snippet);

        const source = await this.findOne(
            ctx,
            { id: input.id },
            { creator: true, collection: true, tags: true },
            { includePrivateSnippet: true },
        );

        const isOwner = source?.creator.id === developer.id;

        if (!source || (!isOwner && (source.isPrivate || !source.allowForking))) {
            throw new EntityNotFoundError({ entityName: 'Snippet', entityId: input.id });
        }

        const snippet = new Snippet({
            name: source.name,
            code: source.code,
            language: source.language,
            description: source.description,
            note: source.note,
            isPrivate: true,
            allowForking: source.allowForking,
            forkedFrom: source,
            creator: developer,
            collection: source.collection,
        });

        const forkInput = { slug: source.slug };
        await this.slugValidator.validateSlug(ctx, forkInput, Snippet);
        snippet.slug = forkInput.slug;

        if (!input.collectionId && source.creator.id === developer.id) {
            snippet.collection = source.collection;
        }

        if (input.collectionId) {
            const collection = await this.collectionService.findOne(ctx, { id: input.collectionId });
            if (!collection) {
                throw new EntityNotFoundError({ entityName: 'Collection', entityId: input.collectionId });
            }
            snippet.collection = collection;
        }

        await repo.save(snippet);
        if (source.tags.length > 0) {
            await repo.createQueryBuilder().relation(Snippet, 'tags').of(snippet).add(source.tags);
            snippet.tags = source.tags;
        }
        await this.eventBus.publish(new SnippetEvent(ctx, snippet, 'forked', input));

        return snippet;
    }

    /**
     * @description
     * Counts a collection's snippets, excluding private or deleted snippets by default.
     * @internal
     */
    public async countSnippetsInCollection(
        ctx: RequestContext,
        input: { collection: Collection },
        options?: { includePrivateSnippets?: boolean; includeSoftDeleted?: boolean },
    ) {
        const snippetCount = await this.databaseService.getRepository(ctx, Snippet).count({
            where: {
                collection: { id: input.collection.id },
                ...(options?.includeSoftDeleted ? {} : { deletedAt: IsNull() }),
                ...(options?.includePrivateSnippets ? {} : { isPrivate: false }),
            },
        });

        return { snippetCount };
    }

    /**
     * @description
     * Counts each developer's snippets, excluding private or deleted snippets by default.
     * @internal
     */
    public async countDevelopersSnippets(
        ctx: RequestContext,
        developerIds: string[],
        options?: { includePrivateSnippets?: boolean; includeSoftDeleted?: boolean },
    ) {
        const snippetRepo = this.databaseService.getRepository(ctx, Snippet);

        const qb = snippetRepo
            .createQueryBuilder('snippet')
            .innerJoin('snippet.creator', 'creator')
            .select('creator.id', 'developerId')
            .addSelect('COUNT(snippet.id)', 'count')
            .where('creator.id IN (:...developerIds)', { developerIds })
            .groupBy('creator.id');

        if (!options?.includePrivateSnippets) {
            qb.andWhere('snippet.isPrivate = :isPrivate', { isPrivate: false });
        }

        if (!options?.includeSoftDeleted) {
            qb.andWhere('snippet.deletedAt IS NULL');
        }

        const counts = await qb.getRawMany<{ developerId: string; count: number | string }>();
        return normalizeDeveloperCounts(developerIds, counts);
    }

    /**
     * @description
     * Counts each developer's forked snippets, excluding private or deleted snippets by default.
     * @internal
     */
    public async countDevelopersForkedSnippets(
        ctx: RequestContext,
        developerIds: string[],
        options?: { includePrivateSnippets?: boolean; includeSoftDeleted?: boolean },
    ) {
        const snippetRepo = this.databaseService.getRepository(ctx, Snippet);

        const qb = snippetRepo
            .createQueryBuilder('snippet')
            .innerJoin('snippet.creator', 'creator')
            .innerJoin('snippet.forkedFrom', 'fork')
            .select('creator.id', 'developerId')
            .addSelect('COUNT(snippet.id)', 'count')
            .where('creator.id IN (:...developerIds)', { developerIds })
            .groupBy('creator.id');

        if (!options?.includePrivateSnippets) {
            qb.andWhere('snippet.isPrivate = :isPrivate', { isPrivate: false });
        }

        if (!options?.includeSoftDeleted) {
            qb.andWhere('snippet.deletedAt IS NULL');
        }

        const counts = await qb.getRawMany<{ developerId: string; count: number | string }>();
        return normalizeDeveloperCounts(developerIds, counts);
    }

    /**
     * @description
     * Adds the current developer's favourite status to each snippet-like item.
     * @internal
     */
    public async attachFavouriteStatus<T extends { id: string }>(
        ctx: RequestContext,
        items: T[],
        developer?: Developer,
    ) {
        const statusById = await this.favouriteService.getFavouriteStatusMapForDeveloper(
            ctx,
            items.map(({ id }) => id),
            'snippets',
            developer,
        );
        return items.map(item => ({
            ...item,
            isFavouritedByCurrentUser: statusById.get(item.id) ?? false,
        }));
    }
}
