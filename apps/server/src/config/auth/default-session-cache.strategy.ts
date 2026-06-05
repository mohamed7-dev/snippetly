import { JSONCompatible } from '@snippetly/common/lib';
import { ModuleRef } from '../../infra/ioc-container/module-ref.service';
import { SessionCacheEntry, SessionCacheStrategy } from './session-cache-strategy.interface';

interface DefaultSessionCacheStrategyConfig {
    prefix?: string;
    /**
     * Time to live in milliseconds
     */
    ttl?: number;
}

export class DefaultSessionCacheStrategy implements SessionCacheStrategy {
    private cacheService: import('../../infra/cache/cache.service').CacheService;
    private readonly cacheTags = ['DefaultSessionCacheStrategy'];

    constructor(private config?: DefaultSessionCacheStrategyConfig) {}

    onInit(moduleRef: ModuleRef): void | Promise<void> {
        const { CacheService } = require('../../infra/cache/cache.service.js');
        this.cacheService = moduleRef.getProvider<typeof CacheService>(CacheService);
    }

    public async set(session: SessionCacheEntry): Promise<void> {
        const key = this.generateKey(session.token);
        const value = this.prepareForStorage(session);
        return await this.cacheService.store(key, value, {
            tags: this.cacheTags,
            ttl: this.config?.ttl ?? 24 * 60 * 60 * 1000, // default 24 hours
        });
    }

    public async get(token: string): Promise<SessionCacheEntry | undefined> {
        const cacheKey = this.generateKey(token);
        const item = await this.cacheService.fetch<JSONCompatible<SessionCacheEntry>>(cacheKey);
        return item ? this.restoreFromStorage(item) : undefined;
    }

    public delete(token: string): void | Promise<void> {
        return this.cacheService.remove(this.generateKey(token));
    }

    public clear(): Promise<void> {
        return this.cacheService.removeBulk(this.cacheTags);
    }

    private prepareForStorage(session: SessionCacheEntry) {
        return {
            ...session,
            sessionExpiry: session.sessionExpiry.toISOString(),
        } as JSONCompatible<SessionCacheEntry>;
    }

    private restoreFromStorage(data: SessionCacheEntry): SessionCacheEntry {
        return {
            ...data,
            sessionExpiry: new Date(data.sessionExpiry),
        };
    }

    private generateKey(token: string) {
        return `${this.config?.prefix ?? 'session-cache'}:${token}`;
    }
}
