import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import { Server } from 'http';
import swaggerUi from 'swagger-ui-express';
import { createRouteHandler } from 'uploadthing/express';
import { cookieSession } from './api/middlewares/cookie-session.mw';
import { cors } from './api/middlewares/cors.mw';
import { exceptionFilter } from './api/middlewares/exception.filter';
import { i18n } from './api/middlewares/i18n.mw';
import { morgan } from './api/middlewares/morgan.mw';
import { notFound } from './api/middlewares/not-found.mw';
import { parseSearchParams } from './api/middlewares/parse-search-params.mw';
import { attachGetRequestContextUtility } from './api/middlewares/request-context.mw';
import { logExpressRoutes } from './api/utils/log-express-routes';
import { ConfigService } from './config/config.service';
import { DatabaseService } from './infra/database/database.service';
import { EventBus } from './infra/event-bus/event-bus.service';
import { I18nService } from './infra/i18n/i18n.service';
import { iocContainer } from './infra/ioc-container/ioc-container';
import { ModuleRef } from './infra/ioc-container/module-ref.service';
import { ModuleClass, Token } from './infra/ioc-container/types';
import { Logger } from './infra/logger/logger';
import { InitializerService } from './services/helpers/initializer.service';
import { uploadRouter } from './services/helpers/uploadthing.service';
import { openApiDocument } from './openapi/openapi';

export class App {
    private app: Application = express();
    private shutdownHooks: Array<() => void | Promise<void>> = [];
    private server: null | Server = null;
    // Prevent concurrent startup and repeated signal handling from running cleanup more than once.
    private isStarting = false;
    private isShuttingDown = false;

    constructor(entryModule: ModuleClass) {
        // initialize ioc container
        iocContainer.loadModule(entryModule);
        this.initializeMiddlewares();
        this.app.get('/api/openapi.json', (_req, res) => {
            res.json(openApiDocument);
        });
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
        iocContainer.initRoutes(this.app);
        this.app.use(
            '/api/upload',
            createRouteHandler({
                router: uploadRouter,
            }),
        );
    }

    public get expressApp() {
        return this.app;
    }

    public async listen(port: number, host: string, callback?: () => void): Promise<void> {
        // Reject invalid repeated startup calls before they can create multiple HTTP servers.
        if (this.isStarting || this.server) {
            throw new Error('The application is already starting or listening');
        }

        this.isStarting = true;
        try {
            // 1. DB first
            await this.connectToDatabase();

            // 2. initialize domain BEFORE starting express app
            await this.onApplicationBootstrap();

            // 3. create express app
            this.initializeApp();

            // 4. start server
            // Wait for the listening event so startup failures are reported to the caller.
            this.server = await new Promise<Server>((resolve, reject) => {
                const server = this.app.listen(port, host, () => {
                    callback?.();
                    resolve(server);
                });
                server.once('error', reject);
            });

            // 2. destroy domain before shutting down the app
            this.onApplicationShutdown();

            this.handleShutdown();
        } catch (error) {
            Logger.error('Failed to start server', undefined, (error as Error).message);
            // Release resources acquired before a later startup step failed.
            await this.runShutdownHooks();
            process.exit(1);
        } finally {
            this.isStarting = false;
        }
    }

    public onShutdown(hook: () => void | Promise<void>): void {
        this.shutdownHooks.push(hook);
    }

    public getProvider<Provider = unknown>(token: Token): Provider {
        return iocContainer.resolve<Provider>(token);
    }

    private async onApplicationBootstrap() {
        await this.initializeI18n();
        await this.initializeInjectableStrategies();
        await this.initializeData();
    }

    private onApplicationShutdown() {
        this.onShutdown(async () => {
            await this.destroyInjectableStrategies();
        });
        this.onShutdown(() => {
            const eventBus = this.getProvider<EventBus>(EventBus);
            eventBus.onModuleDestroy();
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
        const { email } = configService.systemOptions;
        return [
            passwordHashingStrategy,
            sessionCacheStrategy,
            verificationTokenStrategy,
            ...adminAuthenticationStrategies,
            ...developerAuthenticationStrategies,
            email.emailTransporterStrategy,
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
        this.app.use(parseSearchParams);
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
        // Make shutdown idempotent so SIGINT and SIGTERM cannot execute cleanup concurrently.
        const shutdown = async (signal: 'SIGINT' | 'SIGTERM') => {
            if (this.isShuttingDown) return;
            this.isShuttingDown = true;
            Logger.info(`Received ${signal}, shutting down gracefully...`);

            // Stop accepting new connections and wait briefly for existing requests to finish.
            await Promise.race([
                this.closeServer(),
                new Promise<void>(resolve => {
                    setTimeout(() => {
                        Logger.warn('Timed out waiting for HTTP connections to close');
                        resolve();
                    }, 10_000).unref();
                }),
            ]);

            // Run cleanup in reverse registration order and continue after individual failures.
            await this.runShutdownHooks();
            process.exit(0);
        };

        // Register each signal once for this App instance.
        process.once('SIGINT', () => void shutdown('SIGINT'));
        process.once('SIGTERM', () => void shutdown('SIGTERM'));
    }

    private async closeServer(): Promise<void> {
        const server = this.server;
        if (!server) return;

        await new Promise<void>((resolve, reject) => {
            server.close(error => {
                if (error && (error as NodeJS.ErrnoException).code !== 'ERR_SERVER_NOT_RUNNING') {
                    reject(error);
                    return;
                }

                Logger.info('Closed out remaining connections');
                resolve();
            });
        });

        this.server = null;
    }

    private async runShutdownHooks(): Promise<void> {
        // Cleanup hooks must be isolated so one failed resource does not prevent the others from closing.
        for (const hook of [...this.shutdownHooks].reverse()) {
            try {
                await hook();
            } catch (error) {
                Logger.error('Shutdown hook failed', undefined, (error as Error).message);
            }
        }
    }
}
