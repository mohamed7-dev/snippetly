import { FilterGroupOperator, RelatedSnippetsDtoType, SearchDtoType } from '@snippetly/common/dto';
import {
    FindOptionsRelations,
    FindOptionsWhere,
    In,
    IsNull,
    ObjectLiteral,
    ObjectType,
    SelectQueryBuilder,
} from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { ConfigService } from '../../config/config.service';
import { SearchField, SearchStrategy } from '../../config/system/search/search-strategy';
import { Collection } from '../../entities/collections/collection.entity';
import { Developer } from '../../entities/developer/developer.entity';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { Tag } from '../../entities/tags/tag.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

type SearchInput = SearchDtoType['input'];
type TagCount = { value: string; count: number };

interface SearchDefinition<Entity extends ObjectLiteral> {
    entity: ObjectType<Entity>;
    alias: string;
    tagRelation: string;
    tagOwnerRelation: string;
    visibleWhere: FindOptionsWhere<Entity>;
    fields: SearchField[];
    relations: FindOptionsRelations<Entity>;
}

interface SearchPage<Entity> {
    entities: Entity[];
    scores: Map<string, number>;
    totalItems: number;
}

@Injectable()
export class SearchService {
    private readonly searchStrategy: SearchStrategy;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {
        this.searchStrategy = this.configService.systemOptions.searchStrategy;
    }

    /**
     * @description
     * Searches visible snippets, collections, and developers, and returns matching tag counts.
     */
    public async search(ctx: RequestContext, input: SearchInput): Promise<SearchDtoType['output']> {
        const normalizedTerm = input.term?.trim() || undefined;
        const tagValues = Array.from(new Set(input.tags?.values ?? []));
        const definitions = this.getSearchDefinitions();

        const [snippetPage, collectionPage, developerPage] = await Promise.all([
            this.searchEntity(
                ctx,
                input,
                this.searchStrategy,
                definitions.snippets,
                normalizedTerm,
                tagValues,
            ),
            this.searchEntity(
                ctx,
                input,
                this.searchStrategy,
                definitions.collections,
                normalizedTerm,
                tagValues,
            ),
            this.searchEntity(
                ctx,
                input,
                this.searchStrategy,
                definitions.developers,
                normalizedTerm,
                tagValues,
            ),
        ]);
        const tagCountGroups = await Promise.all([
            this.getTagCounts(
                ctx,
                input,
                this.searchStrategy,
                definitions.snippets,
                normalizedTerm,
                tagValues,
            ),
            this.getTagCounts(
                ctx,
                input,
                this.searchStrategy,
                definitions.collections,
                normalizedTerm,
                tagValues,
            ),
            this.getTagCounts(
                ctx,
                input,
                this.searchStrategy,
                definitions.developers,
                normalizedTerm,
                tagValues,
            ),
        ]);

        return {
            snippets: {
                items: snippetPage.entities.map(snippet => ({
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
                    collection:
                        snippet.collection &&
                        !snippet.collection.isPrivate &&
                        !snippet.collection.deletedAt &&
                        !snippet.collection.creator.deletedAt
                            ? {
                                  id: snippet.collection.id,
                                  name: snippet.collection.name,
                                  slug: snippet.collection.slug,
                                  color: snippet.collection.color,
                              }
                            : null,
                    tags: snippet.tags.map(({ value }) => ({ value })),
                    score: snippetPage.scores.get(String(snippet.id)) ?? 0,
                })),
                totalItems: snippetPage.totalItems,
            },
            collections: {
                items: collectionPage.entities.map(collection => ({
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
                    score: collectionPage.scores.get(String(collection.id)) ?? 0,
                })),
                totalItems: collectionPage.totalItems,
            },
            developers: {
                items: developerPage.entities.map(developer => ({
                    id: developer.id,
                    createdAt: developer.createdAt,
                    firstName: developer.firstName,
                    lastName: developer.lastName,
                    bio: developer.bio ?? null,
                    image: developer.image ?? null,
                    isVerified: developer.isVerified,
                    score: developerPage.scores.get(String(developer.id)) ?? 0,
                })),
                totalItems: developerPage.totalItems,
            },
            tagCounts: mergeTagCounts(tagCountGroups.flat()),
        };
    }

    public async findRelatedSnippets(
        ctx: RequestContext,
        sourceSnippet: Snippet,
    ): Promise<RelatedSnippetsDtoType['output']> {
        const definition = this.getSearchDefinitions().snippets;
        const sourceTags = sourceSnippet.tags.map(tag => tag.value);
        const input: SearchInput = { take: 25, skip: 0 };
        const terms = getRelatedSearchTerms(sourceSnippet);
        const [tagMatches, ...termMatches] = await Promise.all([
            sourceTags.length
                ? this.searchEntity(
                      ctx,
                      {
                          ...input,
                          take: 100,
                          tags: { values: sourceTags, operator: FilterGroupOperator.OR },
                      },
                      this.searchStrategy,
                      definition,
                      undefined,
                      sourceTags,
                      false,
                  )
                : Promise.resolve({ entities: [], scores: new Map<string, number>(), totalItems: 0 }),
            ...terms.map(term =>
                this.searchEntity(ctx, { ...input, term }, this.searchStrategy, definition, term, [], false),
            ),
        ]);

        const sourceTagValues = new Set(sourceTags.map(value => value.toLowerCase()));
        const candidates = new Map<string, { snippet: Snippet; score: number; matchingTerms: number }>();

        for (const result of termMatches) {
            for (const snippet of result.entities) {
                if (snippet.id === sourceSnippet.id) continue;
                const candidate = candidates.get(snippet.id) ?? {
                    snippet,
                    score: 0,
                    matchingTerms: 0,
                };
                candidate.score = Math.max(candidate.score, result.scores.get(snippet.id) ?? 0);
                candidate.matchingTerms += 1;
                candidates.set(snippet.id, candidate);
            }
        }

        for (const snippet of tagMatches.entities) {
            if (snippet.id === sourceSnippet.id) continue;
            const candidate = candidates.get(snippet.id) ?? {
                snippet,
                score: 0,
                matchingTerms: 0,
            };
            candidates.set(snippet.id, candidate);
        }

        const items = [...candidates.values()]
            .map(({ snippet, score, matchingTerms }) => {
                const sharedTagCount = snippet.tags.filter(tag =>
                    sourceTagValues.has(tag.value.toLowerCase()),
                ).length;
                const languageMatch = snippet.language.toLowerCase() === sourceSnippet.language.toLowerCase();

                return {
                    snippet,
                    relevance:
                        sharedTagCount * 4 +
                        Math.min(matchingTerms, 3) +
                        Math.min(score, 4) * 0.25 +
                        (languageMatch ? 0.5 : 0),
                };
            })
            .sort((a, b) => b.relevance - a.relevance || a.snippet.name.localeCompare(b.snippet.name))
            .slice(0, 5)
            .map(({ snippet }) => ({
                id: snippet.id,
                name: snippet.name,
                description: snippet.description ?? null,
                language: snippet.language,
            }));

        return { items };
    }

    /**
     * @description
     * Defines searchable fields, visibility rules, and relations for each search entity.
     * @internal
     */
    private getSearchDefinitions(): {
        snippets: SearchDefinition<Snippet>;
        collections: SearchDefinition<Collection>;
        developers: SearchDefinition<Developer>;
    } {
        return {
            snippets: {
                entity: Snippet,
                alias: 'snippet',
                tagRelation: 'tags',
                tagOwnerRelation: 'snippets',
                visibleWhere: { isPrivate: false, deletedAt: IsNull() },
                fields: [
                    { expression: 'snippet.name', weight: 4 },
                    { expression: 'snippet.slug', weight: 2 },
                    { expression: 'snippet.description', weight: 2 },
                    { expression: 'snippet.note', weight: 1 },
                    { expression: 'snippet.language', weight: 1 },
                    { expression: 'snippet.code', weight: 0.5 },
                ],
                relations: { creator: { user: true }, collection: { creator: true }, tags: true },
            },
            collections: {
                entity: Collection,
                alias: 'collection',
                tagRelation: 'tags',
                tagOwnerRelation: 'collections',
                visibleWhere: { isPrivate: false, deletedAt: IsNull() },
                fields: [
                    { expression: 'collection.name', weight: 4 },
                    { expression: 'collection.slug', weight: 2 },
                    { expression: 'collection.description', weight: 2 },
                    { expression: 'collection.color', weight: 1 },
                ],
                relations: { creator: { user: true }, tags: true },
            },
            developers: {
                entity: Developer,
                alias: 'developer',
                tagRelation: 'addedTags',
                tagOwnerRelation: 'addedBy',
                visibleWhere: { isPrivate: false, deletedAt: IsNull() },
                fields: [
                    { expression: 'developer.firstName', weight: 4 },
                    { expression: 'developer.lastName', weight: 4 },
                    { expression: 'developer.bio', weight: 2 },
                ],
                relations: { addedTags: true, user: true },
            },
        };
    }

    /**
     * @description
     * Searches and ranks one entity type using its search definition.
     * @internal
     */
    private async searchEntity<Entity extends ObjectLiteral>(
        ctx: RequestContext,
        input: SearchInput,
        strategy: SearchStrategy,
        definition: SearchDefinition<Entity>,
        term: string | undefined,
        tagValues: string[],
        includeTotalItems = true,
    ): Promise<SearchPage<Entity>> {
        const repository = this.databaseService.getRepository(ctx, definition.entity);
        const query = this.createBaseQuery(
            repository.createQueryBuilder(definition.alias),
            input,
            strategy,
            definition,
            term,
            tagValues,
        );
        const [totalItems, rankedItems] = await Promise.all([
            includeTotalItems ? query.clone().getCount() : Promise.resolve(0),
            this.getRankedIds(query.clone(), definition.alias, input),
        ]);

        if (rankedItems.length === 0) return { entities: [], scores: new Map(), totalItems };

        const entities = await repository.find({
            where: {
                id: In(rankedItems.map(item => item.id)),
                ...definition.visibleWhere,
            } as FindOptionsWhere<Entity>,
            relations: definition.relations,
        });
        const entityById = new Map(entities.map(entity => [String(entity.id), entity]));
        const orderedEntities = rankedItems.flatMap(({ id }) => {
            const entity = entityById.get(id);
            return entity ? [entity] : [];
        });
        const scores = new Map(rankedItems.map(({ id, score }) => [id, score]));

        return { entities: orderedEntities, scores, totalItems };
    }

    /**
     * @description
     * Retrieves the paginated, ranked identifiers and scores from a search query.
     * @internal
     */
    private async getRankedIds<Entity extends ObjectLiteral>(
        query: SelectQueryBuilder<Entity>,
        alias: string,
        input: SearchInput,
    ): Promise<Array<{ id: string; score: number }>> {
        const take = input.take ?? 25;
        const skip = input.skip ?? 0;
        const term = input.term?.trim();

        query.addSelect(`${alias}.id`, 'id');
        if (term) query.orderBy('score', 'DESC');
        else query.orderBy(`${alias}.createdAt`, 'DESC');
        query.addOrderBy(`${alias}.id`, 'ASC').take(take).skip(skip);

        const rows = await query.getRawMany<{ id: string; score: string | number }>();
        return rows.map(row => ({ id: String(row.id), score: Number(row.score) }));
    }

    /**
     * @description
     * Counts matching entities for each tag in a search result set.
     * @internal
     */
    private async getTagCounts<Entity extends ObjectLiteral>(
        ctx: RequestContext,
        input: SearchInput,
        strategy: SearchStrategy,
        definition: SearchDefinition<Entity>,
        term: string | undefined,
        tagValues: string[],
    ): Promise<TagCount[]> {
        const repository = this.databaseService.getRepository(ctx, definition.entity);
        const query = this.createBaseQuery(
            repository.createQueryBuilder(definition.alias),
            input,
            strategy,
            definition,
            term,
            tagValues,
        );

        return query
            .leftJoin(`${definition.alias}.${definition.tagRelation}`, 'resultTag')
            .select('resultTag.value', 'value')
            .addSelect(`COUNT(DISTINCT ${definition.alias}.id)`, 'count')
            .andWhere('resultTag.id IS NOT NULL')
            .groupBy('resultTag.value')
            .getRawMany<{ value: string; count: number | string }>()
            .then(rows => rows.map(row => ({ value: row.value, count: Number(row.count) })));
    }

    /**
     * @description
     * Builds a search query with visibility, text, and selected-tag filters.
     * @internal
     */
    private createBaseQuery<Entity extends ObjectLiteral>(
        query: SelectQueryBuilder<Entity>,
        input: SearchInput,
        strategy: SearchStrategy,
        definition: SearchDefinition<Entity>,
        term: string | undefined,
        tagValues: string[],
    ): SelectQueryBuilder<Entity> {
        query.where(definition.visibleWhere);

        const tagMatchQuery = query
            .subQuery()
            .select('1')
            .from(Tag, 'matchedTag')
            .innerJoin(`matchedTag.${definition.tagOwnerRelation}`, 'matchedOwner')
            .where(`matchedOwner.id = ${definition.alias}.id`)
            .andWhere("LOWER(matchedTag.value) LIKE LOWER(:searchTagPattern) ESCAPE '\\'")
            .getQuery();

        strategy.addSearch(query, term, definition.fields, `EXISTS ${tagMatchQuery}`);
        if (tagValues.length > 0) this.applyTagFilters(query, definition, tagValues, input.tags?.operator);
        return query;
    }

    /**
     * @description
     * Applies the selected tags to a search query using the requested operator.
     * @internal
     */
    private applyTagFilters<Entity extends ObjectLiteral>(
        query: SelectQueryBuilder<Entity>,
        definition: SearchDefinition<Entity>,
        tagValues: string[],
        operator?: FilterGroupOperator,
    ): void {
        const tagQuery = query
            .subQuery()
            .select('tagFilterOwner.id')
            .from(definition.entity, 'tagFilterOwner')
            .innerJoin(`tagFilterOwner.${definition.tagRelation}`, 'tagFilter')
            .where(`tagFilterOwner.id = ${definition.alias}.id`)
            .andWhere('tagFilter.value IN (:...searchTagValues)')
            .groupBy('tagFilterOwner.id');

        if ((operator ?? FilterGroupOperator.AND) === FilterGroupOperator.AND) {
            tagQuery.having('COUNT(DISTINCT tagFilter.value) = :searchTagCount');
        }

        query.andWhere(`${definition.alias}.id IN ${tagQuery.getQuery()}`).setParameters({
            searchTagValues: tagValues,
            searchTagCount: tagValues.length,
        });
    }
}

function getRelatedSearchTerms(snippet: Snippet): string[] {
    const searchableText = [
        snippet.name,
        snippet.description,
        snippet.note,
        snippet.language,
        snippet.code.slice(0, 2000),
    ]
        .filter(Boolean)
        .join(' ');
    const stopWords = new Set([
        'and',
        'are',
        'await',
        'const',
        'false',
        'for',
        'from',
        'function',
        'into',
        'let',
        'null',
        'return',
        'the',
        'this',
        'true',
        'undefined',
        'with',
    ]);

    return [
        ...new Set(
            (searchableText.match(/[\p{L}\p{N}_]+/gu) ?? [])
                .filter(term => term.length > 2 && !stopWords.has(term.toLocaleLowerCase()))
                .map(term => term.toLocaleLowerCase()),
        ),
    ].slice(0, 5);
}

function mergeTagCounts(countGroups: TagCount[]): TagCount[] {
    const counts = new Map<string, number>();
    for (const { value, count } of countGroups) {
        counts.set(value, (counts.get(value) ?? 0) + count);
    }

    return Array.from(counts, ([value, count]) => ({ value, count })).sort(
        (a, b) => b.count - a.count || a.value.localeCompare(b.value),
    );
}
