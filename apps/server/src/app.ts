import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import { Server } from 'http';
import swaggerUi from 'swagger-ui-express';
import { createRouteHandler } from 'uploadthing/express';
import { cors } from './api/middlewares/cors.mw';
import { exceptionFilter } from './api/middlewares/exception.filter';
import { i18n } from './api/middlewares/i18n.mw';
import { morgan } from './api/middlewares/morgan.mw';
import { notFound } from './api/middlewares/not-found.mw';
import { parseSearchParams } from './api/middlewares/parse-search-params.mw';
import { attachGetRequestContextUtility } from './api/middlewares/request-context.mw';
import { logExpressRoutes } from './api/utils/log-express-routes';
import { ConfigModule } from './config/config.module';
import { DatabaseService } from './infra/database/database.service';
import { EventBus } from './infra/event-bus/event-bus.service';
import { I18nModule } from './infra/i18n/i18n.module';
import { iocContainer } from './infra/ioc-container/ioc-container';
import { moduleRef } from './infra/ioc-container/module-ref';
import { ModuleClass, Token } from './infra/ioc-container/types';
import { Logger } from './infra/logger/logger';
import { openApiDocument } from './openapi/openapi';
import { uploadRouter } from './services/helpers/uploadthing.service';
import { ServiceModule } from './services/service.module';

export class App {
    private app: Application = express();
    private shutdownHooks: Array<() => void | Promise<void>> = [];
    private server: null | Server = null;
    // Prevent concurrent startup and repeated signal handling from running cleanup more than once.
    private isStarting = false;
    private isShuttingDown = false;
    private isInitialized = false;

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

    public async initialize(): Promise<void> {
        if (this.isShuttingDown) {
            throw new Error('The application is shutting down');
        }

        if (this.isInitialized) return;

        await this.connectToDatabase();
        await this.onApplicationBootstrap();
        this.initializeApp();
        this.onApplicationShutdown();
        this.isInitialized = true;
    }

    public async close(): Promise<void> {
        if (this.isShuttingDown) return;

        this.isShuttingDown = true;
        Logger.info('Closing application gracefully...');

        try {
            await Promise.race([
                this.closeServer(),
                new Promise<void>(resolve => {
                    setTimeout(() => {
                        Logger.warn('Timed out waiting for HTTP connections to close');
                        resolve();
                    }, 10_000).unref();
                }),
            ]);

            await this.runShutdownHooks();
        } finally {
            this.server = null;
            this.shutdownHooks = [];
            this.isStarting = false;
            this.isInitialized = false;
            this.isShuttingDown = false;
        }
    }

    public async listen(port: number, host: string, callback?: () => void): Promise<void> {
        // Reject invalid repeated startup calls before they can create multiple HTTP servers.
        if (this.isStarting || this.server) {
            throw new Error('The application is already starting or listening');
        }

        this.isStarting = true;
        try {
            await this.initialize();

            // Wait for the listening event so startup failures are reported to the caller.
            this.server = await new Promise<Server>((resolve, reject) => {
                const server = this.app.listen(port, host, () => {
                    callback?.();
                    resolve(server);
                });
                server.once('error', reject);
            });

            this.handleShutdown();
        } catch (error) {
            Logger.error('Failed to start server', undefined, (error as Error).message);
            // Release resources acquired before a later startup step failed.
            await this.runShutdownHooks();
            throw error;
        } finally {
            this.isStarting = false;
        }
    }

    public getProvider<Provider = unknown>(token: Token): Provider {
        return moduleRef.getProvider<Provider>(token);
    }

    private async onApplicationBootstrap() {
        const i18nModule = this.getProvider<I18nModule>(I18nModule);
        await i18nModule.onApplicationBootstrap();
        const configModule = this.getProvider<ConfigModule>(ConfigModule);
        await configModule.onApplicationBootstrap();
        const serviceModule = this.getProvider<ServiceModule>(ServiceModule);
        await serviceModule.onApplicationBootstrap();
    }

    private onApplicationShutdown() {
        this.shutdownHooks.push(async () => {
            const configModule = this.getProvider<ConfigModule>(ConfigModule);
            await configModule.onApplicationShutdown();
        });
        this.shutdownHooks.push(() => {
            const eventBus = this.getProvider<EventBus>(EventBus);
            eventBus.onApplicationShutdown();
        });
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
            Logger.info(`Received ${signal}, shutting down gracefully...`);
            await this.close();
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
