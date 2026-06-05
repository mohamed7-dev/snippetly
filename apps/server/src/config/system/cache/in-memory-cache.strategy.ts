import { JSONCompatible } from '@snippetly/common/lib';
import { CacheEntryOptions, CacheStrategy } from './cache-strategy.interface';

const DEFAULT_CACHE_SIZE = 1000;

interface InMemoryCacheOptions {
    size?: number;
}

interface CacheItem<Value extends JSONCompatible<Value>> {
    value: Value;
    expires?: number;
    tags?: Set<string>;
}

export class InMemoryCacheStrategy implements CacheStrategy {
    private readonly _cacheStore = new Map<string, CacheItem<any>>();
    private _cacheSize: number;

    constructor(options?: InMemoryCacheOptions) {
        this._cacheSize = options?.size ?? DEFAULT_CACHE_SIZE;
    }

    public async set<Value extends JSONCompatible<Value>>(
        key: string,
        value: Value,
        options?: CacheEntryOptions,
    ): Promise<void> {
        const isCacheHit = this._cacheStore.has(key);
        if (isCacheHit) {
            // delete the entry from the cache store, and then append it
            this._cacheStore.delete(key);
        } else if (this._cacheStore.size >= this._cacheSize) {
            // evict the oldest entry
            this._cacheStore.delete(this.getOldestKey());
        }

        this._cacheStore.set(key, {
            value,
            expires: options?.ttl ? options.ttl + Date.now() : undefined,
        });

        if (options?.tags) {
            const foundEntry = this._cacheStore.get(key);
            if (foundEntry) {
                if (!foundEntry.tags) foundEntry.tags = new Set();
                options.tags.forEach(tag => {
                    foundEntry.tags?.add(tag);
                });
            }
        }
    }

    public async get<Value extends JSONCompatible<Value>>(key: string): Promise<Value | undefined> {
        const foundEntry = this._cacheStore.get(key);
        if (foundEntry) return this.checkValidity<Value>(foundEntry) as Value;
        return undefined;
    }

    public async delete(key: string): Promise<void> {
        this._cacheStore.delete(key);
    }

    public async invalidateTags(tags: string[]): Promise<void> {
        tags.forEach(tag => {
            this._cacheStore.forEach((value, key) => {
                if (value.tags?.has(tag)) {
                    this._cacheStore.delete(key);
                }
            });
        });
    }

    private checkValidity<Value extends JSONCompatible<Value>>(entry: CacheItem<Value>): Value | undefined {
        if (entry.expires && entry.expires < Date.now()) return undefined;
        return entry.value;
    }

    private getOldestKey() {
        return this._cacheStore.keys().next().value as string;
    }
}
