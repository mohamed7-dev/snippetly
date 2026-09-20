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
import { Collection } from '../../entities/collections/collection.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { patchEntity } from '../../infra/database/patch-entity';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { CollectionEvent } from '../../infra/event-bus/events/collection.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { SlugValidator } from '../helpers/slug-validator.service';
import { DeveloperService } from './developer.service';
import { TagService } from './tag.service';

@Injectable()
export class CollectionService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly slugValidator: SlugValidator,
        private readonly developerService: DeveloperService,
        private readonly tagService: TagService,
        private readonly eventBus: EventBus,
    ) {}
    public async findOne(
        ctx: RequestContext,
        input: FindOneCollectionDtoType['input'],
        relations?: FindOptionsRelations<Collection>,
    ) {
        const repo = this.databaseService.getRepository(ctx, Collection);

        const collection = await repo.findOne({
            where: {
                id: input.id,
                deletedAt: IsNull(),
            },
            relations: {
                ...relations,
            },
        });

        return collection ?? undefined;
    }
    public async find(
        ctx: RequestContext,
        input: CollectionListDtoType['input'],
        relations?: FindOptionsRelations<Collection>,
    ) {
        const qb = this.listQueryBuilder.build(Collection, input, {
            ctx,
            relations,
            alias: 'c',
        });

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

        return await qb.getManyAndCount().then(result => ({
            items: result[0],
            itemsCount: result[1],
        }));
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

        const source = await repo.findOne({
            where: {
                id: input.id,
            },
            relations: {
                creator: true,
                tags: true,
            },
        });

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
        await this.slugValidator.validateSlug(ctx, input, Collection);

        const repo = this.databaseService.getRepository(ctx, Collection);

        let collection = await repo.findOne({
            where: {
                id: input.id,
            },
        });

        if (!collection || collection.creator.user.id !== ctx.activeUserId) {
            throw new EntityNotFoundError({ entityName: 'Collection', entityId: input.id });
        }

        collection = patchEntity(collection, omit(input, ['tags']));

        if (input.tags) {
            collection.tags = await this.tagService.createTagsFromValues(ctx, input.tags);
        }

        await repo.save(collection);
        await this.eventBus.publish(new CollectionEvent(ctx, collection, 'updated', input));
        return collection;
    }

    public async delete(
        ctx: RequestContext,
        input: DeleteCollectionDtoType['input'],
    ): Promise<DeletionResponse> {
        const repo = this.databaseService.getRepository(ctx, Collection);

        const collection = await repo.findOne({
            where: {
                id: input.id,
            },
            relations: {
                creator: true,
            },
        });

        if (!collection || collection.creator.user.id !== ctx.activeUserId) {
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
