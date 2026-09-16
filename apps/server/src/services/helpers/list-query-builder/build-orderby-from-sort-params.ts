import { filterUnique } from '@snippetly/common/lib';
import type { DataSource, OrderByCondition } from 'typeorm';
import type { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';
import { UserInputError } from '../../../common/errors/errors';
import { SortParameter } from '../../../common/types/list-query-options';
import { ClassType } from '../../../common/types/utils';
import { AppEntity } from '../../../infra/database/app-entity';
import { getEntityMetadata } from '../../../infra/database/get-entity-metadata';

export function buildOrderbyFromSortParams<Entity extends AppEntity>(
    dataSource: DataSource,
    entityType: ClassType<Entity>,
    sortParams?: SortParameter<Entity> | null,
    entityAlias?: string,
): OrderByCondition {
    if (!sortParams) return {};

    const { columns, alias: defaultAlias } = getEntityMetadata(dataSource, entityType);

    const alias = entityAlias ?? defaultAlias;

    const output: OrderByCondition = {};

    for (const [sortProp, direction] of Object.entries(sortParams)) {
        const columnMatch = columns.find(col => col.propertyName === sortProp);
        if (columnMatch) {
            output[`${alias}.${columnMatch.propertyPath}`] = direction as any;
        } else {
            throw new UserInputError('Invalid sort fields', {
                fieldName: sortProp,
                validFields: [...getValidSortFields([...columns])].join(','),
            });
        }
    }

    return output;
}

function getValidSortFields(columns: ColumnMetadata[]): string[] {
    return filterUnique(columns.map(c => c.propertyName));
}
