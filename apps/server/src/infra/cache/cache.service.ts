import { JSONCompatible } from '@snippetly/common/lib';
import { ConfigService } from '../../config/config.service';
import { CacheEntryOptions, CacheStrategy } from '../../config/system/cache/cache-strategy.interface';
import { Injectable } from '../ioc-container/injectable.decorator';
import { Logger } from '../logger/logger';

interface CacheServiceConfiguration {
    /**
     * @description
     * Generates a deterministic cache key for a given identifier within a logical scope.
     * This ensures isolation between different scopes and prevents key collisions
     * across unrelated cache domains.
     */
    generateCacheKey: (identifier: string | number) => string;

    /**
     * @description
     * Specifies the default options applied when persisting entries
     * to the cache store (e.g., TTL, serialization behavior, etc.).
     * These options can typically be overridden per operation.
     */
    defaultEntryOptions?: CacheEntryOptions;
}

@Injectable()
export class CacheService {
    private readonly cacheEngine: CacheStrategy;
    private _cacheServiceConfig: CacheServiceConfiguration;

    constructor(private readonly configService: ConfigService) {
        this.cacheEngine = this.configService.systemOptions.cacheStrategy;
    }

    public async store<Value extends JSONCompatible<Value>>(
        key: string,
        value: Value,
        options?: CacheEntryOptions,
    ): Promise<void> {
        try {
            await this.cacheEngine.set(key, value, options);
            Logger.debug(`[CacheService]: stored key "${key}"`);
        } catch (err: any) {
            Logger.error(`[CacheService]: failed to store key "${key}"`, undefined, (err as Error).stack);
        }
    }

    public async fetch<Value extends JSONCompatible<Value>>(key: string): Promise<Value | undefined> {
        try {
            const value = await this.cacheEngine.get(key);
            if (value !== undefined) {
                Logger.debug(`[CacheService]: hit on key "${key}"`);
            }
            return value as Value;
        } catch (err: any) {
            Logger.error(`[CacheService]: failed to read key "${key}"`, undefined, (err as Error).stack);
        }
    }

    public async remove(key: string): Promise<void> {
        try {
            await this.cacheEngine.delete(key);
            Logger.debug(`[CacheService]: removed key "${key}"`);
        } catch (err: any) {
            Logger.error(`[CacheService]: failed to remove key "${key}"`, undefined, (err as Error).stack);
        }
    }

    public async purgeByTags(tags: string[]): Promise<void> {
        try {
            await this.cacheEngine.invalidateTags(tags);
            Logger.debug(`[CacheService]: purged tags [${tags.join(', ')}]`);
        } catch (err: any) {
            Logger.error(
                `[CacheService]: failed to purge tags [${tags.join(', ')}]`,
                undefined,
                (err as Error).stack,
            );
        }
    }

    public configure(config: CacheServiceConfiguration): void {
        this._cacheServiceConfig = config;
    }

    /**
     * @description
     * Using the underlying cache engine, this method tries to get the cache entry
     * if it exists, it returns the value, otherwise it executes the function and stores the result.
     */
    public async getOrInsert<Value extends JSONCompatible<Value>>(
        key: string,
        fn: () => Value | Promise<Value>,
    ): Promise<Value> {
        const config = this.getConfigOrThrow();
        const cacheKey = config.generateCacheKey(key);
        const hit = await this.fetch<Value>(cacheKey);
        if (hit !== undefined) return hit;

        const value = await fn();
        await this.store(cacheKey, value, config.defaultEntryOptions);
        return value;
    }

    public async removeBulk(idOrIds: string | number | Array<string | number>): Promise<void> {
        const config = this.getConfigOrThrow();
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        const keys = ids.map(id => {
            return config.generateCacheKey(id);
        });
        await Promise.all(keys.map(key => this.remove(key)));
    }

    private getConfigOrThrow() {
        if (!this._cacheServiceConfig) {
            throw new Error('[CacheService]: configuration is not set, make sure to call configure() first');
        }
        return this._cacheServiceConfig;
    }
}
