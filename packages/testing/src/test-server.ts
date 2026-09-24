import { App, AppConfig, AppModule, Logger, runPreConfig } from '@snippetly/server';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import { populate } from './data-population/populate';
import { DatabaseInitializer } from './database-initializer';
import { TestServerOptions, TestServerState } from './types';
import { getCallerFilename } from './utils/get-caller-filename';

export class TestServer {
    public app: App;
    public state: TestServerState = {
        developers: [],
        collections: [],
        snippets: [],
    };

    constructor(private appConfig: Required<AppConfig>) {}

    async init(options: TestServerOptions): Promise<TestServerState> {
        const databaseInitializer = new DatabaseInitializer();
        const testFilename = getCallerFilename(1);
        try {
            await databaseInitializer.init(
                testFilename,
                this.appConfig.database as PostgresConnectionOptions,
            );
            const populateFn = () => this.populateInitialData(this.appConfig, options);
            await databaseInitializer.populate(populateFn);
            await databaseInitializer.destroy();
        } catch (error) {
            throw error;
        }
        await this.bootstrap();
        return this.state;
    }

    public async destroy() {
        // allow a grace period of any outstanding async tasks to complete
        await new Promise(resolve => global.setTimeout(resolve, 500));
        await this.app?.close();
    }

    private async bootstrap() {
        this.app = await this.bootstrapForTesting(this.appConfig);
        (this.app as any).state = this.state;
    }

    private async bootstrapForTesting(this: void, config: Partial<AppConfig>): Promise<App> {
        try {
            const finalConfig = runPreConfig(config);
            Logger.useLogger(finalConfig.system.loggerStrategy);
            const app = new App(AppModule);
            app.expressApp.set('trust proxy', finalConfig.api.trustProxy);

            await app.listen(finalConfig.api.port, finalConfig.api.host, () => {
                Logger.info(`Server running on ${finalConfig.api.host}:${finalConfig.api.port}`);
            });
            return app;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    private async populateInitialData(appConfig: Required<AppConfig>, options: TestServerOptions) {
        const app = await populate(appConfig, this.bootstrapForTesting, {
            logging: false,
            ...options,
        });
        this.state = (app as any).state ?? this.state;
        await app.close();
    }
}
