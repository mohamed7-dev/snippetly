import { AppConfig, mergeConfig } from '@snippetly/server';
import { testConfig as defaultTestConfig } from '@snippetly/testing';
import { getE2ETestDatabase, getE2ETestPostgresPort, getTestFileIndex } from './e2e-common-utils';

export const testConfig = () => {
    const index = getTestFileIndex();
    return mergeConfig(
        {
            api: {
                port: 3010 + index,
            },
            database: resolveDatabaseConfig(),
        },
        defaultTestConfig,
    );
};

function resolveDatabaseConfig(): AppConfig['database'] {
    const db = getE2ETestDatabase();

    switch (db) {
        case 'postgres':
            return {
                synchronize: true,
                type: 'postgres',
                host: '127.0.0.1',
                port: getE2ETestPostgresPort() ?? 5432,
                username: 'snippetly-test',
                password: 'snippetly-test',
                database: 'snippetly-test',
            };
        case 'sqljs':
        default:
            return defaultTestConfig.database;
    }
}
