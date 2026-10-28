import { resolveInitializer } from './db-initializers/db-initializers-registry';
import { getCallerFilename } from './utils/get-caller-filename';

export interface TestServerAdapter<Config, App, State, Options> {
    getDatabaseOptions(config: Config): { type: string };
    createInitialState(): State;
    start(config: Config): Promise<App>;
    populate(
        config: Config,
        options: Options,
        start: (config: Config) => Promise<App>,
        stop: (app: App) => Promise<void>,
    ): Promise<State>;
    stop(app: App): Promise<void>;
    attachState?(app: App, state: State): void;
}

export class TestServer<Config, App, State, Options> {
    public app: App;
    public state: State;

    constructor(
        private config: Config,
        private adapter: TestServerAdapter<Config, App, State, Options>,
    ) {
        this.state = adapter.createInitialState();
    }

    async init(options: Options): Promise<State> {
        this.state = this.adapter.createInitialState();
        const databaseOptions = this.adapter.getDatabaseOptions(this.config);
        const databaseInitializer = resolveInitializer(databaseOptions.type);
        let initialized = false;

        try {
            await databaseInitializer.init(getCallerFilename(1), databaseOptions);
            initialized = true;
            await databaseInitializer.populate(async () => {
                this.state = await this.adapter.populate(
                    this.config,
                    options,
                    config => this.adapter.start(config),
                    app => this.adapter.stop(app),
                );
            });
        } finally {
            if (initialized) {
                await databaseInitializer.destroy();
            }
        }

        this.app = await this.adapter.start(this.config);
        this.adapter.attachState?.(this.app, this.state);
        return this.state;
    }

    async destroy(): Promise<void> {
        await new Promise(resolve => global.setTimeout(resolve, 500));
        if (this.app) {
            await this.adapter.stop(this.app);
        }
    }
}
