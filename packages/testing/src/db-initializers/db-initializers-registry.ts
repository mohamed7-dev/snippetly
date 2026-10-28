import type { DBInitializer } from './db-initializer.interface';

export type InitializerMap = Record<string, DBInitializer<any> | undefined>;

const initializers: InitializerMap = {};

export function addInitializer(databaseType: string, initializer: DBInitializer<any>): void {
    initializers[databaseType] = initializer;
}

export function resolveInitializer(databaseType: string): DBInitializer<any> {
    const initializer = initializers[databaseType];

    if (!initializer) {
        throw new Error(`No database initializer is configured for type "${databaseType}"`);
    }

    return initializer;
}
