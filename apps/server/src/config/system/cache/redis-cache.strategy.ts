import { JSONCompatible } from '@snippetly/common/lib';
import { Logger } from '../../../infra/logger/logger';
import { CacheEntryOptions, CacheStrategy } from './cache-strategy.interface';

export const DEFAULT_NAMESPACE = 'app-cache';
export const DEFAULT_TTL = 86400 * 30;
const LOG_CONTEXT = 'RedisCacheStrategy';

interface RedisCacheStrategyOptions {
    ioredisOptions?: import('ioredis').RedisOptions & { url?: string };
    namespace?: string;
    maxEntrySizeInBytes?: number;
}

export class RedisCacheStrategy implements CacheStrategy {
    private ioredisClient: import('ioredis').Redis;

    constructor(private options: RedisCacheStrategyOptions) {}

    async onInit(): Promise<void> {
        const ioredis = await import('ioredis').then(mod => mod.default);
        const { url, ...redisOptions } = this.options.ioredisOptions ?? {};

        if (url) {
            const redisUrl = new URL(url);
            this.ioredisClient = new ioredis.Redis({
                ...redisOptions,
                host: redisUrl.hostname,
                port: redisUrl.port ? Number(redisUrl.port) : undefined,
                username: redisUrl.username || undefined,
                password: redisUrl.password || undefined,
                db: redisUrl.pathname ? Number(redisUrl.pathname.slice(1)) : undefined,
                ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
            });
            return;
        }

        this.ioredisClient = new ioredis.Redis(redisOptions);
    }

    async onDestroy(): Promise<void> {
        await this.ioredisClient.quit();
    }

    async set<Value extends JSONCompatible<Value>>(
        key: string,
        value: Value,
        options?: CacheEntryOptions,
    ): Promise<void> {
        try {
            const multi = this.ioredisClient.multi();
            const namespaceKey = this.namespace(key);
            const ttl = options?.ttl ? options.ttl / 1000 : DEFAULT_TTL;
            const serializedValue = JSON.stringify(value);

            if (this.options.maxEntrySizeInBytes) {
                const isValid = this.validateEntrySize(
                    serializedValue,
                    this.options.maxEntrySizeInBytes,
                    namespaceKey,
                );
                if (!isValid) return;
            }

            const isValid = this.validateTTL(ttl, namespaceKey);
            if (!isValid) return;

            multi.set(namespaceKey, JSON.stringify(value), 'EX', ttl);
            if (options?.tags) {
                for (const tag of options.tags) {
                    multi.sadd(this.tagNamespace(tag), namespaceKey);
                }
            }
            const results = await multi.exec();
            const resultWithError = results?.find(([err]) => err);
            if (resultWithError) {
                // eslint-disable-next-line @typescript-eslint/only-throw-error
                throw resultWithError[0];
            }
        } catch (error) {
            Logger.error(`Could not set cache item ${key}: ${(error as Error).message}`, LOG_CONTEXT);
        }
    }

    async get<Value extends JSONCompatible<Value>>(key: string): Promise<Value | undefined> {
        try {
            const result = await this.ioredisClient.get(this.namespace(key));
            if (result) {
                try {
                    return JSON.parse(result);
                } catch (error) {
                    Logger.error(
                        `Could not parse cache item ${key}: ${(error as Error).message}`,
                        LOG_CONTEXT,
                    );
                }
            }
        } catch (error) {
            Logger.error(`Could not get cache item ${key}: ${(error as Error).message}`, LOG_CONTEXT);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.ioredisClient.del(this.namespace(key));
        } catch (error) {
            Logger.error(`Could not delete cache item ${key}: ${(error as Error).message}`, LOG_CONTEXT);
        }
    }

    async invalidateTags(tags: string[]): Promise<void> {
        try {
            const cacheKeys = await Promise.all(
                tags.map(tag => this.ioredisClient.smembers(this.tagNamespace(tag))),
            ).then(result => result.flat());

            const pipeline = this.ioredisClient.pipeline();

            cacheKeys.forEach(key => {
                pipeline.del(key);
            });

            tags.forEach(tag => {
                const namespacedTag = this.tagNamespace(tag);
                pipeline.del(namespacedTag);
            });

            await pipeline.exec();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            return Promise.reject(error);
        }
    }

    private validateEntrySize(value: string, maxEntrySizeInBytes: number, key: string) {
        const byteLength = Buffer.byteLength(value);
        if (byteLength > maxEntrySizeInBytes) {
            Logger.error(
                `Could not set cache item ${key}: item size of ${byteLength} bytes exceeds maxItemSizeInBytes of ${maxEntrySizeInBytes} bytes`,
                LOG_CONTEXT,
            );
            return false;
        }

        return true;
    }

    private validateTTL(ttl: number, key: string) {
        if (Math.round(ttl) <= 0) {
            Logger.error(`Could not set cache item ${key}: TTL must be greater than 0 seconds`, LOG_CONTEXT);
            return false;
        }

        return true;
    }

    private namespace(key: string) {
        return `${this.options.namespace ?? DEFAULT_NAMESPACE}:${key}`;
    }

    private tagNamespace(tag: string) {
        return `${this.options.namespace ?? DEFAULT_NAMESPACE}:tag:${tag}`;
    }
}
