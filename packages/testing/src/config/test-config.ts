import { DEFAULT_ADMIN_API_PATH_PREFIX, DEFAULT_DEVELOPER_API_PATH_PREFIX } from '@snippetly/common/lib';
import { defaultAppConfig, LogLevel, mergeConfig, NoopLogger, StdoutLoggerStrategy } from '@snippetly/server';

const logger = process.env.LOG ? new StdoutLoggerStrategy({ logLevel: LogLevel.debug }) : new NoopLogger();

export const testConfig = mergeConfig(
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
        },
    },
    defaultAppConfig,
);
