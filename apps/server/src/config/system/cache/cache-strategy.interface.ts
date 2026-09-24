import { JSONCompatible } from '@snippetly/common/lib';
import { LifecycleStrategy } from '../../../common/types/lifecycle-strategy.interface';

export interface CacheEntryOptions {
    ttl?: number;
    tags?: string[];
}

export interface CacheStrategy extends LifecycleStrategy {
    set<Value extends JSONCompatible<Value>>(
        key: string,
        value: Value,
        options?: CacheEntryOptions,
    ): Promise<void> | void;
    get<Value extends JSONCompatible<Value>>(key: string): Promise<Value | undefined> | void;
    delete(key: string): Promise<void> | void;
    invalidateTags(tags: string[]): Promise<void> | void;
}
