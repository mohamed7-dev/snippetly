import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import { Server } from 'http';
import { cookieSession } from './api/middlewares/cookie-session.mw';
import { cors } from './api/middlewares/cors.mw';
import { exceptionFilter } from './api/middlewares/exception.filter';
import { i18n } from './api/middlewares/i18n.mw';
import { morgan } from './api/middlewares/morgan.mw';
import { notFound } from './api/middlewares/not-found.mw';
import { attachGetRequestContextUtility } from './api/middlewares/request-context.mw';
import { logExpressRoutes } from './api/utils/log-express-routes';
import { ConfigService } from './config/config.service';
import { DatabaseService } from './infra/database/database.service';
import { I18nService } from './infra/i18n/i18n.service';
import { iocContainer } from './infra/ioc-container/ioc-container';
import { ModuleRef } from './infra/ioc-container/module-ref.service';
import { ModuleClass, Token } from './infra/ioc-container/types';
import { Logger } from './infra/logger/logger';
import { InitializerService } from './services/helpers/initializer.service';

export class App {
    private app: Application = express();
    private shutdownHooks: Array<() => void | Promise<void>> = [];
    private server: null | Server = null;

    constructor(entryModule: ModuleClass) {
        // load modules, and providers first before database connection
        iocContainer.loadModule(entryModule);
        this.initializeMiddlewares();
        iocContainer.initRoutes(this.app);
    }

    public get expressApp() {
        return this.app;
    }

    public async listen(port: number, _host?: string, callback?: () => void): Promise<void> {
        try {
            // 1. DB first
            await this.connectToDatabase();

            // 2. initialize domain BEFORE express
            await this.onModuleInit();

            // 3. create express app
            this.initializeApp();

            // 4. start server
            this.server = this.app.listen(port, () => {
                callback?.();
            });

            this.handleShutdown();
        } catch (error) {
            Logger.error('Failed to start server', undefined, (error as Error).message);
            process.exit(1);
        }
    }

    public onShutdown(hook: () => void | Promise<void>): void {
        this.shutdownHooks.push(hook);
    }

    public getProvider<Provider = unknown>(token: Token): Provider {
        return iocContainer.resolve<Provider>(token);
    }

    private async onModuleInit() {
        await this.initializeI18n();
        await this.initializeInjectableStrategies();
        await this.initializeData();
        this.onShutdown(async () => {
            await this.destroyInjectableStrategies();
        });
    }

    private async initializeData() {
        const initializerService = this.getProvider<InitializerService>(InitializerService);
        await initializerService.initialize();
    }

    private async initializeI18n() {
        const i18nService = this.getProvider<I18nService>(I18nService);
        await i18nService.initialize();
    }

    private async initializeInjectableStrategies() {
        for (const configItem of this.getInjectableConfigStrategies()) {
            if (typeof configItem.onInit === 'function') {
                await configItem.onInit(new ModuleRef());
            }
        }
    }

    private async destroyInjectableStrategies() {
        for (const configItem of this.getInjectableConfigStrategies()) {
            if (typeof configItem.onDestroy === 'function') {
                await configItem.onDestroy();
            }
        }
    }

    private getInjectableConfigStrategies() {
        const configService = this.getProvider<ConfigService>(ConfigService);
        const {
            passwordHashingStrategy,
            adminAuthenticationStrategies,
            developerAuthenticationStrategies,
            sessionCacheStrategy,
            verificationTokenStrategy,
        } = configService.authOptions;
        const { emailTransporterStrategy, binaryStorageStrategy } = configService.systemOptions;
        return [
            passwordHashingStrategy,
            sessionCacheStrategy,
            verificationTokenStrategy,
            ...adminAuthenticationStrategies,
            ...developerAuthenticationStrategies,
            emailTransporterStrategy,
            binaryStorageStrategy,
        ];
    }

    private async connectToDatabase() {
        const databaseService = this.getProvider<DatabaseService>(DatabaseService);
        await databaseService.connect().then(() => {
            this.shutdownHooks.push(async () => await databaseService.disconnect());
        });
    }

    private initializeApp() {
        this.initializeErrorHandling();
        logExpressRoutes(this.app);
    }

    private initializeMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cookieSession());
        this.app.use(cors());
        this.app.use(i18n());
        this.app.use(morgan);
        this.app.use(attachGetRequestContextUtility());
    }

    private initializeErrorHandling() {
        this.app.use(notFound);
        this.app.use(exceptionFilter);
    }

    private handleShutdown() {
        const shutdown = (signal: 'SIGINT' | 'SIGTERM') => {
            Logger.info(`Received ${signal}, shutting down gracefully...`);
            if (this.server) {
                this.server.close(() => {
                    Logger.info('Closed out remaining connections');
                    process.exit(0);
                });

                void Promise.allSettled(this.shutdownHooks.map(h => h())).catch(() => {
                    // ignore
                });

                // Force shutdown after 10s
                setTimeout(() => {
                    Logger.info('Forcing shutdown...');
                    process.exit(1);
                }, 10_000).unref();
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
}
