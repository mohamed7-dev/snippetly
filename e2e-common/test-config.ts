import { DEFAULT_ADMIN_API_PATH_PREFIX, DEFAULT_DEVELOPER_API_PATH_PREFIX } from '@snippetly/common/lib';
import {
    AppConfig,
    defaultAppConfig,
    DummyJobQueueStrategy,
    LogLevel,
    mergeConfig,
    NoopLogger,
    StdoutLoggerStrategy,
} from '@snippetly/server';
import { addInitializer, PostgresqlDBInitializer, SqljsDBInitializer } from '@snippetly/testing';
import path from 'node:path';
import {
    getE2ETestDatabase,
    getE2ETestPostgresPort,
    getPackageDir,
    getTestFileIndex,
} from './e2e-common-utils';

const packageDir = getPackageDir();
const logger = process.env.LOG ? new StdoutLoggerStrategy({ logLevel: LogLevel.debug }) : new NoopLogger();

const defaultTestConfig = mergeConfig(
    {
        api: {
            port: 3050,
            disableRateLimiting: true,
            admin: {
                path: DEFAULT_ADMIN_API_PATH_PREFIX,
            },
            developer: {
                path: DEFAULT_DEVELOPER_API_PATH_PREFIX,
            },
            cors: { credentials: true, origin: true },
        },
        auth: {
            requireVerification: true,
        },
        database: {
            type: 'sqljs',
            database: new Uint8Array([]),
            location: '',
            autoSave: false,
            logging: false,
        },
        system: {
            loggerStrategy: logger,
            jobQueueStrategy: new DummyJobQueueStrategy(),
        },
    },
    defaultAppConfig,
);

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
