import { App, AppConfig, AppModule, Logger, runPreConfig } from '@snippetly/server';
import type { TestServerAdapter } from '@snippetly/testing';
import { populate } from './data-population/populate';
import { TestServerOptions, TestServerState } from './types';

type AppWithTestState = App & { state?: TestServerState };

const emptyTestServerState = (): TestServerState => ({
    developers: [],
    collections: [],
    snippets: [],
    friendships: [],
});

export const serverTestAdapter: TestServerAdapter<
    Required<AppConfig>,
    App,
    TestServerState,
    TestServerOptions
> = {
    getDatabaseOptions: config => config.database,
    createInitialState: emptyTestServerState,

    start: bootstrapForTesting,

    async populate(config, options, start, stop) {
        let app: App | undefined;

        try {
            await populate(
                config,
                async config => {
                    app = await start(config as Required<AppConfig>);
                    return app;
                },
                options,
            );

            return (app as AppWithTestState | undefined)?.state ?? emptyTestServerState();
        } finally {
            if (app) {
                await stop(app);
            }
        }
    },

    stop: app => app.close(),

    attachState(app, state) {
        (app as AppWithTestState).state = state;
    },
};

async function bootstrapForTesting(config: Partial<AppConfig>): Promise<App> {
    const finalConfig = runPreConfig(config);
    Logger.useLogger(finalConfig.system.loggerStrategy);
    const app = new App(AppModule);
    app.expressApp.set('trust proxy', finalConfig.api.trustProxy);

    await app.listen(finalConfig.api.port, finalConfig.api.host, () => {
        Logger.info(`Server running on ${finalConfig.api.host}:${finalConfig.api.port}`);
    });

    return app;
}
