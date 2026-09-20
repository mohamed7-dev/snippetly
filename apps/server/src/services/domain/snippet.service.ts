import {
    CreateSnippetDtoType,
    DeleteSnippetDtoType,
    FindOneSnippetDtoType,
    ForkSnippetDtoType,
    SnippetListDtoType,
    UpdateSnippetDtoType,
    UserFriendsSnippetsListDtoType,
} from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { FindOptionsRelations, In, IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { EntityNotFoundError } from '../../common/errors/errors';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { SnippetEvent } from '../../infra/event-bus/events/snippet.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { SlugValidator } from '../helpers/slug-validator.service';
import { CollectionService } from './collection.service';
import { DeveloperService } from './developer.service';
import { FriendshipService } from './friendship.service';
import { TagService } from './tag.service';

@Injectable()
export class SnippetService {
    constructor(
        private readonly slugValidator: SlugValidator,
        private readonly developerService: DeveloperService,
        private readonly collectionService: CollectionService,
        private readonly databaseService: DatabaseService,
        private readonly tagService: TagService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly friendshipService: FriendshipService,
        private readonly eventBus: EventBus,
    ) {}

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
            const collection = await this.collectionService.findOne(ctx, { id: input.collectionId });
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

    public async findOne(
        ctx: RequestContext,
        input: FindOneSnippetDtoType['input'],
        relations?: FindOptionsRelations<Snippet>,
    ) {
        const repo = this.databaseService.getRepository(ctx, Snippet);

        return (
            (await repo.findOne({
                where: { id: input.id, deletedAt: IsNull() },
                relations: {
                    creator: true,
                    collection: true,
                    tags: true,
                    ...relations,
                },
            })) ?? undefined
        );
    }

    public async getUserFriendsSnippets(
        ctx: RequestContext,
        developerId: string,
        input: UserFriendsSnippetsListDtoType['input'],
    ) {
        const friendships = await this.friendshipService.getCurrentUserFriends(ctx, developerId, {});

        if (!friendships.items.length) {
            return { items: [], itemsCount: 0 };
        }

        const friendIds = friendships.items.map(friendship =>
            friendship.requester.id === developerId ? friendship.addressee.id : friendship.requester.id,
        );

        const qb = this.listQueryBuilder.build(Snippet, input, {
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
            },
            orderBy: {
                createdAt: 'DESC',
            },
        });

        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    public async find(
        ctx: RequestContext,
        input: SnippetListDtoType['input'],
        relations?: FindOptionsRelations<Snippet>,
    ) {
        const qb = this.listQueryBuilder.build(Snippet, input, {
            ctx,
            relations: {
                creator: true,
                collection: true,
                tags: true,
                ...relations,
            },
            alias: 's',
        });

        if (input.tags?.values?.length) {
            const tagSubquery = qb.connection
                .createQueryBuilder()
                .select('snippet.id')
                .from(Snippet, 'snippet')
                .innerJoin('snippet.tags', 'tag')
                .where('tag.value IN (:...tagValues)')
                .groupBy('snippet.id')
                .having('COUNT(DISTINCT tag.id) = :tagCount');

            qb.andWhere(`s.id IN (${tagSubquery.getQuery()})`).setParameters({
                tagValues: input.tags,
                tagCount: input.tags?.values?.length,
            });
        }

        if (input.collection) {
            qb.innerJoin('s.collection', 'collection');
            qb.andWhere('collection.id = :collectionId', {
                collectionId: input.collection,
            });
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

    public async update(ctx: RequestContext, input: UpdateSnippetDtoType['input']) {
        const developer = await this.developerService.getActiveDeveloper(ctx, true);

        await this.slugValidator.validateSlug(ctx, input, Snippet);

        const repo = this.databaseService.getRepository(ctx, Snippet);
        let snippet = await repo.findOne({
            where: { id: input.id },
            relations: { creator: true, collection: true, tags: true },
        });

        if (!snippet || snippet.creator.id !== developer.id) {
            throw new EntityNotFoundError({ entityName: 'Snippet', entityId: input.id });
        }

        const { collectionId, tags, ...snippetInput } = input;
        snippet = Object.assign(snippet, omit(snippetInput, ['id']));

        if (collectionId) {
            const collection = await this.collectionService.findOne(ctx, { id: collectionId });
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

    public async delete(
        ctx: RequestContext,
        input: DeleteSnippetDtoType['input'],
    ): Promise<{ result: 'DELETED' | 'NOT_DELETED'; message: string }> {
        const developer = await this.developerService.getActiveDeveloper(ctx);
        if (!developer) {
            return { result: 'NOT_DELETED', message: 'Snippet not found' };
        }

        const repo = this.databaseService.getRepository(ctx, Snippet);
        const snippet = await repo.findOne({
            where: { id: input.id },
            relations: { creator: true },
        });

        if (!snippet || snippet.creator.id !== developer.id) {
            return { result: 'NOT_DELETED', message: 'Snippet not found' };
        }

        snippet.deletedAt = new Date();
        await repo.save(snippet);
        await this.eventBus.publish(new SnippetEvent(ctx, snippet, 'deleted', input));

        return { result: 'DELETED', message: '' };
    }

    public async fork(ctx: RequestContext, input: ForkSnippetDtoType['input']) {
        const developer = await this.developerService.getActiveDeveloper(ctx, true);

        const repo = this.databaseService.getRepository(ctx, Snippet);
        const source = await repo.findOne({
            where: { id: input.id },
            relations: { creator: true, collection: true, tags: true },
        });

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
            tags: source.tags,
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

        await repo.save(snippet, { reload: false });
        await this.eventBus.publish(new SnippetEvent(ctx, snippet, 'forked', input));

        return snippet;
    }
}
