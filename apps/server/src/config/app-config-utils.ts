import { isConstructorInstance, isObjectOrNull } from '@snippetly/common/lib';
import path from 'node:path';
import { assignPropToObject, prototypeObjectPropNames } from '../common/helpers/utils';
import { AppConfig, PartialAppConfig, RuntimeAppConfig } from './app-config.interface';

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
        this._appConfig = this.mergeConfig(userConfig, this._appConfig);
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
            } catch (e) {
                console.log(e);
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

    private static mergeConfig<Dest extends AppConfig>(
        source: PartialAppConfig,
        dest: Dest,
        depth = 0,
    ): Dest {
        if (!source) return dest;

        if (isObjectOrNull(source) && isObjectOrNull(dest)) {
            for (const key in source) {
                const typedKey = key as keyof typeof source;
                if (prototypeObjectPropNames.includes(typedKey)) continue;

                const sourceValue = source[typedKey];
                const destValue = dest[typedKey];

                if (isObjectOrNull(sourceValue)) {
                    // if the dest object doesn't have this key -> initialize
                    if (!dest[typedKey]) {
                        this.assign(typedKey, {}, dest);
                    }
                    if (isConstructorInstance(sourceValue)) {
                        // if it's a constructor -> assign instance directly to dest
                        this.assign(typedKey, sourceValue, dest);
                    } else {
                        // if not a constructor instance -> recurse Into nested objects
                        this.mergeConfig(
                            sourceValue as unknown as PartialAppConfig,
                            destValue as unknown as Dest,
                            depth + 1,
                        );
                    }
                } else {
                    // primitive -> assign directly to dest
                    this.assign(typedKey, sourceValue, dest);
                }
            }
        }

        return dest;
    }

    private static assign(key: string, value: any, dest: any): void {
        assignPropToObject(dest, key, value);
    }

    private static getDefaultAppConfig(): RuntimeAppConfig {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(AppConfigUtils.defaultConfigPath).defaultAppConfig as RuntimeAppConfig;
    }
}
