import type { DataSourceOptions } from 'typeorm';
import type { DBInitializer } from './db-initializer.interface';

export type InitializerMap = {
    [K in DataSourceOptions['type']]?: DBInitializer<any>;
};

const initializers: InitializerMap = {};

export function addInitializer(
    databaseType: DataSourceOptions['type'],
    initializer: DBInitializer<any>,
): void {
    initializers[databaseType] = initializer;
}

export function resolveInitializer(databaseType: DataSourceOptions['type']): DBInitializer<any> {
    const initializer = initializers[databaseType];

    if (!initializer) {
        throw new Error(`No database initializer is configured for type "${databaseType}"`);
    }

    return initializer;
}
