import {
    FavouriteCollectionsListDtoType,
    FavouriteDevelopersListDtoType,
    FavouriteSnippetsListDtoType,
    FilterGroupOperator,
    SuccessResponse,
} from '@snippetly/common/dto';
import { Brackets, type EntityTarget, IsNull, type SelectQueryBuilder } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { EntityNotFoundError, ForbiddenError } from '../../common/errors/errors';
import { Collection } from '../../entities/collections/collection.entity';
import { Developer } from '../../entities/developer/developer.entity';
import { Favourite } from '../../entities/favourites/favourite.entity';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { AppEntity } from '../../infra/database/app-entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';

export type FavouriteResourceType = 'snippets' | 'collections' | 'developers';

@Injectable()
export class FavouriteService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly listQueryBuilder: ListQueryBuilder,
    ) {}

    /**
     * @description
     * Adds a resource to a developer's favourites if it is not already favourited.
     */
    public async add(
        ctx: RequestContext,
        developerId: string,
        resourceType: FavouriteResourceType,
        resourceId: string,
    ): Promise<SuccessResponse> {
        const favouriteRepo = this.databaseService.getRepository(ctx, Favourite);
        let target: Favourite;

        if (resourceType === 'snippets') {
            const snippet = await this.databaseService.getRepository(ctx, Snippet).findOne({
                where: [
                    { id: resourceId, isPrivate: false, deletedAt: IsNull() },
                    { id: resourceId, isPrivate: true, creator: { id: developerId }, deletedAt: IsNull() },
                ],
                relations: { creator: true },
            });
            if (!snippet) {
                throw new EntityNotFoundError({ entityName: 'Snippet', entityId: resourceId });
            }
            target = new Favourite({ developer: new Developer({ id: developerId }), snippet });
        } else if (resourceType === 'collections') {
            const collection = await this.databaseService.getRepository(ctx, Collection).findOne({
                where: [
                    { id: resourceId, isPrivate: false, deletedAt: IsNull() },
                    { id: resourceId, isPrivate: true, creator: { id: developerId }, deletedAt: IsNull() },
                ],
                relations: { creator: true },
            });
            if (!collection) {
                throw new EntityNotFoundError({ entityName: 'Collection', entityId: resourceId });
            }
            target = new Favourite({ developer: new Developer({ id: developerId }), collection });
        } else {
            const developer = await this.databaseService.getRepository(ctx, Developer).findOne({
                where: { id: resourceId, isPrivate: false, deletedAt: IsNull() },
            });
            if (!developer) {
                throw new EntityNotFoundError({ entityName: 'Developer', entityId: resourceId });
            }
            if (developer.id === developerId) {
                throw new ForbiddenError();
            }
            target = new Favourite({
                developer: new Developer({ id: developerId }),
                favoritedDeveloper: developer,
            });
        }

        const matchingTarget =
            resourceType === 'snippets'
                ? { snippet: { id: resourceId } }
                : resourceType === 'collections'
                  ? { collection: { id: resourceId } }
                  : { favoritedDeveloper: { id: resourceId } };

        const existing = await favouriteRepo.findOne({
            where: { developer: { id: developerId }, ...matchingTarget },
        });
        if (!existing) {
            await favouriteRepo.save(target);
        }

        return { success: true };
    }

    /**
     * @description
     * Removes a resource from a developer's favourites if it is favourited.
     */
    public async remove(
        ctx: RequestContext,
        developerId: string,
        resourceType: FavouriteResourceType,
        resourceId: string,
    ): Promise<SuccessResponse> {
        const matchingTarget =
            resourceType === 'snippets'
                ? { snippet: { id: resourceId } }
                : resourceType === 'collections'
                  ? { collection: { id: resourceId } }
                  : { favoritedDeveloper: { id: resourceId } };
        const repository = this.databaseService.getRepository(ctx, Favourite);
        const favourite = await repository.findOne({
            where: { developer: { id: developerId }, ...matchingTarget },
        });

        if (favourite) {
            await repository.remove(favourite);
        }

        return { success: true };
    }

    /**
     * @description
     * Gets the favourite status of the supplied resources for a developer.
     * @internal
     */
    public async getFavouriteStatusMapForDeveloper(
        ctx: RequestContext,
        resourceIds: string[],
        resourceType: FavouriteResourceType,
        developer?: Developer,
    ): Promise<Map<string, boolean>> {
        const statusById = new Map(resourceIds.map(id => [id, false]));

        if (!developer || resourceIds.length === 0) {
            return statusById;
        }

        const relationName =
            resourceType === 'snippets'
                ? 'snippet'
                : resourceType === 'collections'
                  ? 'collection'
                  : 'favoritedDeveloper';

        const favouritedResources = await this.databaseService
            .getRepository(ctx, Favourite)
            .createQueryBuilder('favourite')
            .innerJoin('favourite.developer', 'favouritingDeveloper')
            .innerJoin(`favourite.${relationName}`, 'resource')
            .select('resource.id', 'resourceId')
            .where('favouritingDeveloper.id = :developerId', { developerId: developer.id })
            .andWhere('resource.id IN (:...resourceIds)', { resourceIds })
            .andWhere('resource.deletedAt IS NULL')
            .getRawMany<{ resourceId: string }>();

        for (const { resourceId } of favouritedResources) {
            statusById.set(resourceId, true);
        }

        return statusById;
    }

    /**
     * @description
     * Lists the snippets a developer has favourited.
     */
    public async listSnippets(
        ctx: RequestContext,
        developerId: string,
        input: FavouriteSnippetsListDtoType['input'],
    ): Promise<FavouriteSnippetsListDtoType['output']> {
        const qb = this.listQueryBuilder.build(Snippet, input as any, {
            ctx,
            alias: 's',
            customPropsMap: {
                creatorFirstName: 'creator.firstName',
                creatorLastName: 'creator.lastName',
            },
            relations: { creator: { user: true }, tags: true },
            where: { deletedAt: IsNull(), creator: { deletedAt: IsNull() } },
        });
        qb.innerJoin('s.creator', 'favouriteOwner').andWhere(
            new Brackets(query =>
                query
                    .where('s.isPrivate = :isPrivate', { isPrivate: false })
                    .orWhere('favouriteOwner.id = :favouriteOwnerId', { favouriteOwnerId: developerId }),
            ),
        );
        qb.innerJoin(
            Favourite,
            'favourite',
            'favourite.snippetId = s.id AND favourite.developerId = :favouriteDeveloperId',
            { favouriteDeveloperId: developerId },
        );
        this.applyTagFilter(qb, Snippet, 's', input.tags);
        const [snippets, itemsCount] = await qb.getManyAndCount();

        return {
            items: snippets.map(snippet => ({
                id: snippet.id,
                createdAt: snippet.createdAt,
                name: snippet.name,
                slug: snippet.slug,
                language: snippet.language,
                description: snippet.description ?? null,
                creator: {
                    id: snippet.creator.id,
                    firstName: snippet.creator.firstName,
                    lastName: snippet.creator.lastName,
                    image: snippet.creator.image ?? null,
                    isVerified: snippet.creator.isVerified,
                },
                tags: snippet.tags.map(({ value }) => ({ value })),
            })),
            itemsCount,
        };
    }

    /**
     * @description
     * Lists the collections a developer has favourited.
     */
    public async listCollections(
        ctx: RequestContext,
        developerId: string,
        input: FavouriteCollectionsListDtoType['input'],
    ): Promise<FavouriteCollectionsListDtoType['output']> {
        const qb = this.listQueryBuilder.build(Collection, input as any, {
            ctx,
            alias: 'c',
            customPropsMap: {
                creatorFirstName: 'creator.firstName',
                creatorLastName: 'creator.lastName',
            },
            relations: { creator: { user: true }, tags: true },
            where: { deletedAt: IsNull(), creator: { deletedAt: IsNull() } },
        });
        qb.innerJoin('c.creator', 'favouriteOwner').andWhere(
            new Brackets(query =>
                query
                    .where('c.isPrivate = :isPrivate', { isPrivate: false })
                    .orWhere('favouriteOwner.id = :favouriteOwnerId', { favouriteOwnerId: developerId }),
            ),
        );
        qb.innerJoin(
            Favourite,
            'favourite',
            'favourite.collectionId = c.id AND favourite.developerId = :favouriteDeveloperId',
            { favouriteDeveloperId: developerId },
        );
        this.applyTagFilter(qb, Collection, 'c', input.tags);
        const [collections, itemsCount] = await qb.getManyAndCount();

        return {
            items: collections.map(collection => ({
                id: collection.id,
                createdAt: collection.createdAt,
                name: collection.name,
                slug: collection.slug,
                color: collection.color,
                description: collection.description ?? null,
                creator: {
                    id: collection.creator.id,
                    firstName: collection.creator.firstName,
                    lastName: collection.creator.lastName,
                    image: collection.creator.image ?? null,
                    isVerified: collection.creator.isVerified,
                },
                tags: collection.tags.map(({ value }) => ({ value })),
            })),
            itemsCount,
        };
    }

    /**
     * @description
     * Lists the developers a developer has favourited.
     */
    public async listDevelopers(
        ctx: RequestContext,
        developerId: string,
        input: FavouriteDevelopersListDtoType['input'],
    ): Promise<FavouriteDevelopersListDtoType['output']> {
        const qb = this.listQueryBuilder.build(Developer, input as any, {
            ctx,
            alias: 'd',
            where: { isPrivate: false, deletedAt: IsNull() },
        });
        qb.innerJoin(
            Favourite,
            'favourite',
            'favourite.favoritedDeveloperId = d.id AND favourite.developerId = :favouriteDeveloperId',
            { favouriteDeveloperId: developerId },
        );
        qb.leftJoinAndSelect('d.user', 'user');
        const [developers, itemsCount] = await qb.getManyAndCount();

        return {
            items: developers.map(developer => ({
                id: developer.id,
                createdAt: developer.createdAt,
                firstName: developer.firstName,
                lastName: developer.lastName,
                image: developer.image ?? null,
                bio: developer.bio ?? null,
                isVerified: developer.isVerified,
            })),
            itemsCount,
        };
    }

    /**
     * @description
     * Applies the requested tag filter to a favourites query.
     * @internal
     */
    private applyTagFilter<Entity extends AppEntity & (Snippet | Collection)>(
        qb: SelectQueryBuilder<Entity>,
        entity: EntityTarget<Entity>,
        alias: string,
        tagFilter: { values?: string[]; operator?: FilterGroupOperator } | undefined,
    ) {
        const tagValues = tagFilter?.values;
        if (!tagFilter || !tagValues?.length) return;

        const subquery = qb.connection
            .createQueryBuilder()
            .select('resource.id')
            .from(entity, 'resource')
            .innerJoin('resource.tags', 'tag')
            .where('tag.value IN (:...favouriteTagValues)', { favouriteTagValues: tagValues });

        if ((tagFilter.operator ?? FilterGroupOperator.AND) === FilterGroupOperator.AND) {
            subquery.groupBy('resource.id').having('COUNT(DISTINCT tag.id) = :favouriteTagCount', {
                favouriteTagCount: tagValues.length,
            });
        }

        qb.andWhere(`${alias}.id IN (${subquery.getQuery()})`).setParameters(subquery.getParameters());
    }
}
