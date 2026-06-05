import { LifecycleStrategy } from '../../common/types/lifecycle-strategy.interface';

export interface SessionCacheUser {
    id: string;
    identifier: string;
    isVerified: boolean;
    permissions: string[];
}

export interface SessionCacheEntry {
    token: string;
    id: string;
    authStrategyName?: string;
    user?: SessionCacheUser;
    sessionExpiry: Date;
    /**
     * Timestamp when this entry becomes stale and should be refreshed
     */
    cacheExpiry: number;
}

export interface SessionCacheStrategy extends LifecycleStrategy {
    set(session: SessionCacheEntry): void | Promise<void>;

    get(token: string): SessionCacheEntry | undefined | Promise<SessionCacheEntry | undefined>;

    delete(token: string): void | Promise<void>;

    clear(): void | Promise<void>;
}
