import 'reflect-metadata';
import { App } from './app';
import { AppModule } from './app.module';
import { AppConfigUtils } from './config/app-config-utils';
import { PartialAppConfig, RuntimeAppConfig } from './config/app-config.interface';
import { Logger } from './infra/logger/logger';

export async function bootstrap(
    userConfig?: PartialAppConfig,
    options: { listen?: boolean } = { listen: true },
): Promise<App> {
    const finalConfig = runPreConfig(userConfig);
    Logger.useLogger(finalConfig.system.loggerStrategy);

    const app = new App(AppModule);
    app.expressApp.set('trust proxy', finalConfig.api.trustProxy);
    exposeHeaders(finalConfig);
    if (options.listen === false) {
        await app.initialize();
    } else {
        await app.listen(finalConfig.api.port, finalConfig.api.host, () => {
            Logger.info(`Server running on ${finalConfig.api.host}:${finalConfig.api.port}`);
        });
    }
    return app;
}

export function runPreConfig(config?: PartialAppConfig): RuntimeAppConfig {
    if (config) {
        AppConfigUtils.setConfig(config);
    }
    return AppConfigUtils.getConfig();
}

function exposeHeaders(config: RuntimeAppConfig) {
    const authTokenHeaderKey = config.auth.authTokenHeaderKey;
    const corsOptions = config.api.cors;
    if (typeof corsOptions !== 'boolean') {
        const { exposedHeaders } = corsOptions;
        let exposedHeadersWithAuthKey: string[];
        if (!exposedHeaders) {
            exposedHeadersWithAuthKey = [authTokenHeaderKey];
        } else if (typeof exposedHeaders === 'string') {
            exposedHeadersWithAuthKey = exposedHeaders
                .split(',')
                .map(x => x.trim())
                .concat(authTokenHeaderKey);
        } else {
            exposedHeadersWithAuthKey = exposedHeaders.concat(authTokenHeaderKey);
        }
        corsOptions.exposedHeaders = exposedHeadersWithAuthKey;
    }
}
