import { AppConfig, mergeConfig } from '@snippetly/server';
import {
    addInitializer,
    testConfig as defaultTestConfig,
    PostgresqlDBInitializer,
    SqljsDBInitializer,
} from '@snippetly/testing';
import path from 'node:path';
import {
    getE2ETestDatabase,
    getE2ETestPostgresPort,
    getPackageDir,
    getTestFileIndex,
} from './e2e-common-utils';

const packageDir = getPackageDir();

addInitializer('sqljs', new SqljsDBInitializer(path.join(packageDir, '__data__')));
addInitializer('postgres', new PostgresqlDBInitializer());

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
