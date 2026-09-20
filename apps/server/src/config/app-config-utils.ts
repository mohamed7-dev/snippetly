import { isConstructorInstance, isObject } from '@snippetly/common/lib';
import path from 'node:path';
import { OBJECT_PROTOTYPE_KEYS } from '../common/constants/common';
import { simpleDeepClone } from '../common/helpers/simple-deep-clone';
import { assignToObject } from '../common/helpers/utils';
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

    private static mergeConfig<Target extends AppConfig>(
        src: PartialAppConfig,
        dest: Target,
        depth: number = 0,
    ): Target {
        if (!src) return dest;

        if (depth === 0) {
            // clone dest to keep original dest object un-mutated
            dest = simpleDeepClone(dest);
        }

        if (isObject(src) && isObject(dest)) {
            for (const key in src) {
                if (OBJECT_PROTOTYPE_KEYS.includes(key)) {
                    continue;
                }
                const srcTypedKey = key as keyof typeof src;
                const srcValue = src[srcTypedKey];
                if (isObject(srcValue)) {
                    // object has three possibilities:
                    // 1. class constructor
                    // 2. plain object
                    // 3. value exists in src, but not in dest
                    const destValue = dest[srcTypedKey];
                    if (!destValue) {
                        // value doesn't exist in dest -> init
                        assignToObject(dest, srcTypedKey, {});
                    }
                    if (isConstructorInstance(srcValue)) {
                        // constructor -> assign directly to dest
                        assignToObject(dest, srcTypedKey, srcValue);
                    } else {
                        // plain object -> run recursively
                        this.mergeConfig(
                            srcValue as unknown as PartialAppConfig,
                            dest[srcTypedKey] as unknown as RuntimeAppConfig,
                            depth + 1,
                        );
                    }
                } else {
                    // primitive -> assign directly to dest
                    assignToObject(dest, srcTypedKey, srcValue);
                }
            }
        }

        return dest;
    }
}
