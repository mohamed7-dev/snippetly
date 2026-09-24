import path from 'node:path';
import { PartialAppConfig, RuntimeAppConfig } from './app-config.interface';
import { mergeConfig } from './merge-config';

/**
 * @description
 * Utility class for managing application configuration.
 * Handles config initialization, caching, merging, and retrieval.
 */
export class AppConfigUtils {
    private static _appConfig: RuntimeAppConfig;
    private static readonly defaultConfigPath = path.join(__dirname, 'default-app-config');

    /**
     * @description
     * Sets configuration by merging overrides into the current config.
     */
    public static setConfig(userConfig: PartialAppConfig): void {
        if (!this._appConfig) {
            this._appConfig = this.getDefaultAppConfig();
        }
        this._appConfig = mergeConfig(userConfig, this._appConfig);
    }

    /**
     * @description
     * Retrieves the current application configuration.
     * Loads initial config if not already cached.
     */
    public static getConfig(): RuntimeAppConfig {
        if (!this._appConfig) {
            try {
                this._appConfig = this.getDefaultAppConfig();
            } catch {
                console.error(
                    "[AppConfig]: config can't be loaded, make sure to call `AppConfigUtils.cacheConfig()` method before running this method.",
                );
            }
        }

        return this._appConfig;
    }

    /**
     * @description
     * Loads and caches the initial application configuration.
     */
    public static cacheConfig() {
        const appConfig = this.getDefaultAppConfig();
        AppConfigUtils._appConfig = appConfig;
        return appConfig;
    }

    private static getDefaultAppConfig(): RuntimeAppConfig {
        return require(AppConfigUtils.defaultConfigPath).defaultAppConfig as RuntimeAppConfig;
    }
}
