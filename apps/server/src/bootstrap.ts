import 'reflect-metadata';
import { App } from './app';
import { AppModule } from './app.module';
import { AppConfigUtils } from './config/app-config-utils';
import { PartialAppConfig, RuntimeAppConfig } from './config/app-config.interface';
import { Logger } from './infra/logger/logger';

export async function bootstrap(userConfig?: PartialAppConfig): Promise<App> {
    const finalConfig = runPreConfig(userConfig);
    Logger.useLogger(finalConfig.system.loggerStrategy);

    const app = new App(AppModule);
    await app.listen(finalConfig.api.port, finalConfig.api.host, () => {
        Logger.info(`Server running on http://${finalConfig.api.host}:${finalConfig.api.port}`);
    });
    return app;
}

function runPreConfig(config?: PartialAppConfig): RuntimeAppConfig {
    if (config) {
        AppConfigUtils.setConfig(config);
    }
    return AppConfigUtils.getConfig();
}
