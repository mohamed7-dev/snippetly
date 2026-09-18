import { JSONCompatible } from '@snippetly/common/lib';

export interface CacheEntryOptions {
    ttl?: number;
    tags?: string[];
}

export interface CacheStrategy {
    set<Value extends JSONCompatible<Value>>(
        key: string,
        value: Value,
        options?: CacheEntryOptions,
    ): Promise<void> | void;
    get<Value extends JSONCompatible<Value>>(key: string): Promise<Value | undefined> | void;
    delete(key: string): Promise<void> | void;
    invalidateTags(tags: string[]): Promise<void> | void;
}
