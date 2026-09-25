import { FilterGroupOperator } from '@snippetly/common/dto';
import { isObject } from '@snippetly/common/lib';
import {
    Brackets,
    type FindOneOptions,
    type FindOptionsRelations,
    type FindOptionsWhere,
    type WhereExpressionBuilder,
} from 'typeorm';
import { RequestContext } from '../../../api/request-context/request-context';
import { UserInputError } from '../../../common/errors/errors';
import { ListQueryOptions } from '../../../common/types/list-query-options';
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

        qb.setFindOptions({
            relations: extraOptions.relations,
            take,
            skip,
            relationLoadStrategy: 'query',
            where: extraOptions.where ?? {},
        });

        // maps gql input fields to typeorm OrderByCondition
        const sortParams = Object.assign({}, options.sort, extraOptions.orderBy);

        const order = buildOrderbyFromSortParams(ds, entityType, sortParams, qb.alias);

        let filterConditions: Array<WhereGroup | WhereCondition> = [];
        if (options.filter) {
            // maps input fields to where clause and params
            filterConditions = buildConditionFromFilterParams(options.filter, entityType, ds, qb.alias);
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
