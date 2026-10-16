import { FilterGroupOperator } from '@snippetly/common/dto';
import { isObject } from '@snippetly/common/lib';
import {
    Brackets,
    Repository,
    type FindOneOptions,
    type FindOptionsRelations,
    type FindOptionsWhere,
    type SelectQueryBuilder,
    type WhereExpressionBuilder,
} from 'typeorm';
import { RequestContext } from '../../../api/request-context/request-context';
import { UserInputError } from '../../../common/errors/errors';
import { FilterParameter, ListQueryOptions } from '../../../common/types/list-query-options';
import { ClassType } from '../../../common/types/utils';
import { ConfigService } from '../../../config';
import { AppEntity } from '../../../infra/database/app-entity';
import { DatabaseService } from '../../../infra/database/database.service';
import { Injectable } from '../../../infra/ioc-container/injectable.decorator';
import {
    buildConditionFromFilterParams,
    type WhereCondition,
    type WhereGroup,
} from './build-conditions-from-filter-params';
import { buildOrderbyFromSortParams } from './build-orderby-from-sort-params';

interface ExtraOptions<Entity extends AppEntity> {
    ignoreQueryLimits?: boolean;
    alias?: string;
    relations?: FindOptionsRelations<Entity>;
    ctx?: RequestContext;
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[];
    orderBy?: FindOneOptions<Entity>['order'];
    customPropsMap?: Record<string, string>;
}

interface RelationTree {
    [relation: string]: boolean | RelationTree | undefined;
}

interface ResolvedCustomPropsMap {
    filters: Record<string, string>;
    order: Record<string, string>;
}

function mergeRelationTrees(target: RelationTree, source: object): void {
    for (const [relation, value] of Object.entries(source)) {
        if (value === true || value === false) {
            if (value || !(relation in target)) target[relation] = value;
            continue;
        }

        if (!isObject(value)) continue;
        if (target[relation] === true) continue;

        const nested = isObject(target[relation]) ? target[relation] : {};
        target[relation] = nested;
        mergeRelationTrees(nested, value);
    }
}

@Injectable()
export class ListQueryBuilder {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {}

    public build<Entity extends AppEntity>(
        entityType: ClassType<Entity>,
        options: ListQueryOptions<Entity> = {},
        extraOptions: ExtraOptions<Entity> = {},
    ) {
        const maxQueryLimits =
            extraOptions.ctx?.apiType === 'admin'
                ? this.configService.apiOptions.admin.listingLimit
                : this.configService.apiOptions.developer.listingLimit;

        const { take, skip } = this.parsePaginationParams(
            options,
            extraOptions.ignoreQueryLimits ?? false,
            maxQueryLimits,
        );

        const ds = this.databaseService.dataSource;
        const repo = this.databaseService.getRepository(extraOptions?.ctx, entityType);
        const alias = extraOptions?.alias ? extraOptions.alias : entityType.name.toLowerCase();

        const qb = repo.createQueryBuilder(alias);

        // get minimum relations required by the custom props map
        const minimumRequiredRelations = this.getMinimumRequiredRelations(extraOptions, options, repo);
        const relations = minimumRequiredRelations;
        mergeRelationTrees(relations, extraOptions.relations ?? {});

        qb.setFindOptions({
            relations: relations as FindOptionsRelations<Entity>,
            take,
            skip,
            where: extraOptions.where ?? {},
        });

        const customPropsMap = this.resolveCustomPropsMap(extraOptions.customPropsMap, options, qb);

        // maps gql input fields to typeorm OrderByCondition
        const sortParams = Object.assign({}, options.sort, extraOptions.orderBy);

        const order = buildOrderbyFromSortParams(
            ds,
            entityType,
            sortParams,
            customPropsMap?.order,
            qb.alias,
        );

        let filterConditions: Array<WhereGroup | WhereCondition> = [];
        if (options.filter) {
            // maps input fields to where clause and params
            filterConditions = buildConditionFromFilterParams(
                options.filter,
                entityType,
                ds,
                customPropsMap?.filters,
                qb.alias,
            );
        }

        if (filterConditions.length) {
            qb.andWhere(
                new Brackets(qb1 => {
                    for (const condition of filterConditions) {
                        if ('conditions' in condition) {
                            this.applyNestedWhereClause(qb1, condition, FilterGroupOperator.AND);
                        } else {
                            this.applyWhereCondition(qb1, condition, FilterGroupOperator.AND);
                        }
                    }
                }),
            );
        }

        qb.orderBy(order);

        return qb;
    }

    private getMinimumRequiredRelations<Entity extends AppEntity>(
        extraOptions: ExtraOptions<Entity>,
        options: ListQueryOptions<Entity>,
        repo: Repository<Entity>,
    ): RelationTree {
        const requiredRelations: RelationTree = {};

        if (extraOptions.customPropsMap) {
            // {collectionName: snippet.collection.name}
            for (const [prop, path] of Object.entries(extraOptions.customPropsMap)) {
                if (!this.isCustomPropUsed(prop, options)) {
                    continue;
                }
                if (path.includes('{')) continue;
                const relationPath = path.split('.').slice(0, -1);

                let targetMetadata = repo.metadata;
                const relationNames: string[] = [];

                for (const pathPart of relationPath) {
                    const relationMetadata = targetMetadata.findRelationWithPropertyPath(pathPart);
                    if (!relationMetadata) break;

                    relationNames.push(relationMetadata.propertyName);
                    targetMetadata = relationMetadata.inverseEntityMetadata;
                }

                if (relationNames.length !== relationPath.length) continue;

                let relationTree = requiredRelations;
                for (const [index, relationName] of relationNames.entries()) {
                    const existing = relationTree[relationName];
                    if (existing === true) break;
                    if (index === relationNames.length - 1) {
                        relationTree[relationName] = true;
                        break;
                    }
                    const nested = isObject(existing) ? existing : {};
                    relationTree[relationName] = nested;
                    relationTree = nested;
                }
            }
        }
        return requiredRelations;
    }

    private resolveCustomPropsMap<Entity extends AppEntity>(
        customPropsMap: Record<string, string> | undefined,
        options: ListQueryOptions<Entity>,
        qb: SelectQueryBuilder<Entity>,
    ): ResolvedCustomPropsMap | undefined {
        if (!customPropsMap) return undefined;

        const resolved: ResolvedCustomPropsMap = { filters: {}, order: {} };

        for (const [prop, path] of Object.entries(customPropsMap)) {
            if (!this.isCustomPropUsed(prop, options)) continue;

            if (path.includes('{')) {
                const expression = path.replace(
                    /\{([^}]+)\}\.([A-Za-z_$][\w$]*)/g,
                    (_match, relationPath: string, column: string) =>
                        this.resolveRelationColumn(qb, relationPath, column, prop),
                );
                qb.addSelect(expression, prop);
                resolved.filters[prop] = expression;
                resolved.order[prop] = prop;
                continue;
            }

            const segments = path.split('.');
            const column = segments.pop();
            if (!column) throw new Error(`Invalid custom property path "${path}"`);

            const relationPath = segments.join('.');
            const resolvedColumn = relationPath
                ? this.resolveRelationColumn(qb, relationPath, column, prop)
                : `${qb.alias}.${column}`;
            resolved.filters[prop] = resolvedColumn;
            resolved.order[prop] = resolvedColumn;
        }

        return resolved;
    }

    private resolveRelationColumn<Entity extends AppEntity>(
        qb: SelectQueryBuilder<Entity>,
        relationPath: string,
        column: string,
        prop: string,
    ): string {
        let parentAlias = qb.alias;
        for (const relation of relationPath.split('.')) {
            const join = qb.expressionMap.joinAttributes.find(
                item => item.parentAlias === parentAlias && item.relationPropertyPath === relation,
            );
            if (!join) {
                throw new Error(
                    `Unable to resolve joined relation "${relation}" for custom property "${prop}"`,
                );
            }
            parentAlias = join.alias.name;
        }
        return `${parentAlias}.${column}`;
    }

    private isCustomPropUsed(prop: string, options: ListQueryOptions<any>): boolean {
        return !!options.sort?.[prop] || this.isCustomPropUsedInFilter(prop, options.filter);
    }

    private isCustomPropUsedInFilter(prop: string, filterParams?: FilterParameter<any> | null): boolean {
        return !!(
            filterParams &&
            (filterParams[prop] ||
                filterParams._and?.some(f => this.isCustomPropUsedInFilter(prop, f)) ||
                filterParams._or?.some(f => this.isCustomPropUsedInFilter(prop, f)))
        );
    }

    private applyNestedWhereClause(
        qb: WhereExpressionBuilder,
        group: WhereGroup,
        parentOperator: FilterGroupOperator,
    ): void {
        if (group.conditions.length) {
            const subQueryBuilder = new Brackets(qb1 => {
                group.conditions.forEach(condition => {
                    if ('conditions' in condition) {
                        this.applyNestedWhereClause(qb1, condition, group.operator);
                    } else {
                        this.applyWhereCondition(qb1, condition, group.operator);
                    }
                });
            });

            if (parentOperator === FilterGroupOperator.AND) {
                qb.andWhere(subQueryBuilder);
            } else {
                qb.orWhere(subQueryBuilder);
            }
        }
    }

    private applyWhereCondition(
        qb: WhereExpressionBuilder,
        condition: WhereCondition,
        groupOperator: FilterGroupOperator,
    ) {
        if (groupOperator === FilterGroupOperator.AND) {
            qb.andWhere(condition.clause, condition.parameters);
        } else if (groupOperator === FilterGroupOperator.OR) {
            qb.orWhere(condition.clause, condition.parameters);
        }
    }

    private parsePaginationParams<Entity extends AppEntity>(
        options: ListQueryOptions<Entity>,
        ignoreQueryLimits: boolean,
        maxQueryLimits: number,
    ): {
        take: number;
        skip: number;
    } {
        let max = 0;

        if (ignoreQueryLimits) {
            max = Number.MAX_SAFE_INTEGER;
        } else {
            max = maxQueryLimits;
        }

        const takeOptionExists = isObject(options) && 'take' in options;

        if (takeOptionExists && options.take && options.take > max) {
            throw new UserInputError(`Cannot take more than ${maxQueryLimits} results from a list query`);
        }

        let take = max;

        if (takeOptionExists && options.take == null) {
            take = max;
        } else if (takeOptionExists && options.take) {
            // max -> 1000
            // take -> 10 *

            // max -> 1000 *
            // take -> 0

            // max -> 1000 *
            // take -> -10
            take = Math.min(max, Math.max(options.take, 0));
        }

        const skipOptionsExists = isObject(options) && 'skip' in options;

        const skip = skipOptionsExists ? Math.max(options.skip ?? 0, 0) : 0;

        if (
            skipOptionsExists &&
            options.skip !== undefined &&
            takeOptionExists &&
            options.take === undefined
        ) {
            take = max;
        }
        return {
            skip,
            take,
        };
    }
}
