import {
    CollectionListDtoType,
    CreateCollectionDtoType,
    DeleteCollectionDtoType,
    DeletionResponse,
    FilterGroupOperator,
    FindOneCollectionDtoType,
    ForkCollectionDtoType,
    UpdateCollectionDtoType,
} from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { FindOptionsRelations, IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { EntityNotFoundError, ForbiddenError } from '../../common/errors/errors';
import { OnApplicationBootstrap } from '../../common/types/lifecycle-hooks';
import { Collection } from '../../entities/collections/collection.entity';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { patchEntity } from '../../infra/database/patch-entity';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { CollectionEvent } from '../../infra/event-bus/events/collection.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { AppJob, JobQueue } from '../helpers/job-qeueue.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { normalizeDeveloperCounts } from '../helpers/normalize-developer-counts';
import { SlugValidator } from '../helpers/slug-validator.service';
import { DeveloperService } from './developer.service';
import { TagService } from './tag.service';

@Injectable()
export class CollectionService implements OnApplicationBootstrap {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly slugValidator: SlugValidator,
        private readonly developerService: DeveloperService,
        private readonly tagService: TagService,
        private readonly eventBus: EventBus,
        private readonly jobQueue: JobQueue,
    ) {}

    /**@internal */
    onApplicationBootstrap(): void {
        this.eventBus.ofType(CollectionEvent).subscribe(e => {
            if (e.type === 'forked' && e.entity.forkedFrom) {
                const job: AppJob = {
                    type: 'copy-collection-snippets',
                    sourceCollectionId: e.entity.forkedFrom?.id,
                    targetCollectionId: e.entity.id,
                    developerId: e.entity.creator.id,
                };
                void this.jobQueue.enqueue(job, 10);
            }
        });
    }

    public async findOne(
        ctx: RequestContext,
        input: FindOneCollectionDtoType['input'],
        relations?: FindOptionsRelations<Collection>,
        options?: { includePrivateCollection?: boolean; includeSoftDeleted?: boolean },
    ) {
        const repo = this.databaseService.getRepository(ctx, Collection);

        const collection = await repo.findOne({
            where: {
                id: input.id,
                ...(options?.includeSoftDeleted ? {} : { deletedAt: IsNull() }),
                ...(options?.includePrivateCollection ? {} : { isPrivate: false }),
            },
            relations: {
                ...relations,
            },
        });

        if (!collection) {
            return undefined;
        }

        return collection;
    }
    public async find(
        ctx: RequestContext,
        input: CollectionListDtoType['input'],
        relations?: FindOptionsRelations<Collection>,
        options?: { includePrivateCollections?: boolean; includeSoftDeleted?: boolean },
    ) {
        const qb = this.listQueryBuilder.build(Collection, input as any, {
            ctx,
            relations,
            alias: 'c',
            where: {
                ...(options?.includeSoftDeleted ? {} : { deletedAt: IsNull() }),
                ...(options?.includePrivateCollections ? {} : { isPrivate: false }),
            },
        });

        if (input.discover === true) {
            const activeDeveloper = await this.developerService.getActiveDeveloper(ctx);
            if (activeDeveloper) {
                qb.innerJoin('c.creator', 'discoverCreator').andWhere(
                    'discoverCreator.id <> :activeDeveloperId',
                    { activeDeveloperId: activeDeveloper.id },
                );
            }
        }

        const tags = input.tags;
        const tagValues = tags?.values;

        if (tagValues && tagValues.length) {
            const operator = tags?.operator ?? FilterGroupOperator.AND;
            const subquery = qb.connection
                .createQueryBuilder()
                .select('collection.id')
                .from(Collection, 'collection')
                .leftJoin('collection.tags', 'tags')
                .where('tags.value IN (:...tags)');

            if (operator === FilterGroupOperator.AND) {
                subquery.groupBy('collection.id').having('COUNT(collection.id) = :tagCount');
            }

            qb.andWhere(`c.id IN (${subquery.getQuery()})`).setParameters({
                tags: tagValues,
                tagCount: tagValues.length,
            });
        }

        if (input.creator) {
            qb.innerJoin('c.creator', 'creator');
            qb.andWhere('creator.id = :creatorId', {
                creatorId: input.creator,
            });
        }

        const [items, itemsCount] = await qb.getManyAndCount();

        return { items, itemsCount };
    }

    public async countDevelopersCollections(
        ctx: RequestContext,
        developerIds: string[],
        options?: { includePrivateCollections?: boolean; includeSoftDeleted?: boolean },
    ) {
        const collectionRepo = this.databaseService.getRepository(ctx, Collection);

        const qb = collectionRepo
            .createQueryBuilder('collection')
            .innerJoin('collection.creator', 'creator')
            .select('creator.id', 'developerId')
            .addSelect('COUNT(collection.id)', 'count')
            .where('creator.id IN (:...developerIds)', { developerIds })
            .groupBy('creator.id');

        if (!options?.includePrivateCollections) {
            qb.andWhere('collection.isPrivate = :isPrivate', { isPrivate: false });
        }

        if (!options?.includeSoftDeleted) {
            qb.andWhere('collection.deletedAt IS NULL');
        }

        const counts = await qb.getRawMany<{ developerId: string; count: number | string }>();
        return normalizeDeveloperCounts(developerIds, counts);
    }

    public async countDevelopersForkedCollections(
        ctx: RequestContext,
        developerIds: string[],
        options?: { includePrivateCollections?: boolean; includeSoftDeleted?: boolean },
    ) {
        const collectionRepo = this.databaseService.getRepository(ctx, Collection);

        const qb = collectionRepo
            .createQueryBuilder('collection')
            .innerJoin('collection.creator', 'creator')
            .innerJoin('collection.forkedFrom', 'fork')
            .select('creator.id', 'developerId')
            .addSelect('COUNT(collection.id)', 'count')
            .where('creator.id IN (:...developerIds)', { developerIds })
            .groupBy('creator.id');

        if (!options?.includePrivateCollections) {
            qb.andWhere('collection.isPrivate = :isPrivate', { isPrivate: false });
        }

        if (!options?.includeSoftDeleted) {
            qb.andWhere('collection.deletedAt IS NULL');
        }

        const counts = await qb.getRawMany<{ developerId: string; count: number | string }>();
        return normalizeDeveloperCounts(developerIds, counts);
    }

    public async isCollectionOwnedBy(
        ctx: RequestContext,
        collectionId: string,
        developerId: string,
    ): Promise<boolean> {
        const collection = await this.findOne(
            ctx,
            { id: collectionId },
            { creator: { user: true } },
            { includePrivateCollection: true, includeSoftDeleted: true },
        );
        return collection?.creator?.id === developerId;
    }

    public async addSnippetsPreview(
        ctx: RequestContext,
        items: Collection[],
        options: { includePrivateSnippets: boolean },
    ) {
        const snippetsQuery = this.databaseService
            .getRepository(ctx, Snippet)
            .createQueryBuilder('snippet')
            .innerJoin('snippet.collection', 'collection')
            .select('collection.id', 'collectionId')
            .addSelect('snippet.id', 'snippetId')
            .addSelect('snippet.name', 'snippetName')
            .addSelect('snippet.language', 'snippetLanguage')
            .addSelect('COUNT(snippet.id) OVER (PARTITION BY collection.id)', 'snippetCount')
            .addSelect(
                'ROW_NUMBER() OVER (PARTITION BY collection.id ORDER BY snippet.createdAt DESC, snippet.id DESC)',
                'rowNumber',
            )
            .where('collection.id IN (:...collectionIds)', { collectionIds: items.map(item => item.id) })
            .andWhere('snippet.deletedAt IS NULL');

        if (!options.includePrivateSnippets) {
            snippetsQuery.andWhere('snippet.isPrivate = :isPrivate', { isPrivate: false });
        }

        const snippetRows = await snippetsQuery.connection
            .createQueryBuilder()
            .select('ranked."collectionId"', 'collectionId')
            .addSelect('ranked."snippetId"', 'snippetId')
            .addSelect('ranked."snippetName"', 'snippetName')
            .addSelect('ranked."snippetLanguage"', 'snippetLanguage')
            .addSelect('ranked."snippetCount"', 'snippetCount')
            .from(`(${snippetsQuery.getQuery()})`, 'ranked')
            .where('ranked."rowNumber" <= :previewLimit', { previewLimit: 5 })
            .orderBy('ranked."collectionId"', 'ASC')
            .addOrderBy('ranked."rowNumber"', 'ASC')
            .setParameters(snippetsQuery.getParameters())
            .getRawMany<{
                collectionId: string;
                snippetId: string;
                snippetName: string;
                snippetLanguage: string;
                snippetCount: string;
            }>();

        const snippetCountByCollection = new Map<string, number>();
        const snippetsByCollection = new Map<string, Array<{ id: string; name: string; language: string }>>();

        for (const row of snippetRows) {
            snippetCountByCollection.set(row.collectionId, Number(row.snippetCount));
            const snippets = snippetsByCollection.get(row.collectionId) ?? [];
            snippets.push({
                id: row.snippetId,
                name: row.snippetName,
                language: row.snippetLanguage,
            });
            snippetsByCollection.set(row.collectionId, snippets);
        }

        return { snippetCountByCollection, snippetsByCollection };
    }

    public async create(ctx: RequestContext, input: CreateCollectionDtoType['input']) {
        // resolve developer from current active user
        const developer = await this.developerService.getActiveDeveloper(ctx, true);

        await this.slugValidator.validateSlug(ctx, input, Collection);

        const collection = new Collection({
            name: input.name,
            slug: input.slug,
            color: input.color,
            description: !input.description?.length ? null : input.description,
            allowForking: input.allowForking,
            isPrivate: input.isPrivate,
            creator: developer,
        });

        // handle tags relation
        if (input.tags) {
            collection.tags = await this.tagService.createTagsFromValues(ctx, input.tags);
        }
        const repo = this.databaseService.getRepository(ctx, Collection);

        await repo.save(collection);

        await this.eventBus.publish(new CollectionEvent(ctx, collection, 'created', input));

        return collection;
    }

    public async fork(ctx: RequestContext, input: ForkCollectionDtoType['input']) {
        const developer = await this.developerService.getActiveDeveloper(ctx, true);

        const repo = this.databaseService.getRepository(ctx, Collection);

        const source = await this.findOne(
            ctx,
            { id: input.id },
            { creator: true, tags: true },
            { includePrivateCollection: true, includeSoftDeleted: false },
        );

        if (!source) {
            throw new EntityNotFoundError({
                entityName: 'Collection',
                entityId: input.id,
            });
        }

        const isOwner = source.creator.id === developer.id;

        if ((!isOwner && source.isPrivate) || (!isOwner && !source.allowForking)) {
            throw new ForbiddenError();
        }

        const forkInput = {
            slug: source.slug,
        };

        await this.slugValidator.validateSlug(ctx, forkInput, Collection);

        const fork = new Collection({
            name: source.name,
            slug: forkInput.slug,
            color: source.color,
            description: source.description,
            isPrivate: true,
            allowForking: source.allowForking,
            creator: developer,
            forkedFrom: source,
            tags: source.tags,
        });

        await this.eventBus.publish(new CollectionEvent(ctx, fork, 'forked', input));

        await repo.save(fork);

        return fork;
    }

    public async update(ctx: RequestContext, input: UpdateCollectionDtoType['input']) {
        const repo = this.databaseService.getRepository(ctx, Collection);

        let collection = await this.findOne(
            ctx,
            { id: input.id },
            { creator: true },
            { includePrivateCollection: true, includeSoftDeleted: false },
        );

        if (!collection || (ctx.isAuthorizedAsOwnerOnly && collection.creator.user.id !== ctx.activeUserId)) {
            throw new EntityNotFoundError({ entityName: 'Collection', entityId: input.id });
        }
        await this.slugValidator.validateSlug(ctx, input, Collection);

        collection = patchEntity(collection, omit(input, ['tags']));

        if (input.tags) {
            collection.tags = await this.tagService.createTagsFromValues(ctx, input.tags);
        }

        await repo.save(collection);
        await this.eventBus.publish(new CollectionEvent(ctx, collection, 'updated', input));
        return collection;
    }

    public async softDelete(
        ctx: RequestContext,
        input: DeleteCollectionDtoType['input'],
    ): Promise<DeletionResponse> {
        const repo = this.databaseService.getRepository(ctx, Collection);

        const collection = await this.findOne(
            ctx,
            input,
            { creator: true },
            { includePrivateCollection: true, includeSoftDeleted: false },
        );

        if (!collection || (ctx.isAuthorizedAsOwnerOnly && collection.creator.user.id !== ctx.activeUserId)) {
            return {
                result: 'NOT_DELETED',
                message: 'Collection not found',
            };
        }

        collection.deletedAt = new Date();
        await repo.save(collection);
        await this.eventBus.publish(new CollectionEvent(ctx, collection, 'deleted', input));

        return {
            result: 'DELETED',
            message: '',
        };
    }
}
