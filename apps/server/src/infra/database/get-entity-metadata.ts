import type { DataSource } from 'typeorm';
import type { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';
import { ClassType } from '../../common/types/utils';

export function getEntityMetadata<Entity>(
    dataSource: DataSource,
    entity: ClassType<Entity>,
): {
    columns: ColumnMetadata[];
    alias: string;
} {
    const metadata = dataSource.getMetadata(entity);
    const columns = metadata.columns;
    const alias = metadata.name.toLowerCase();
    return {
        columns,
        alias,
    };
}
