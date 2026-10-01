import rateLimit, { Options } from 'express-rate-limit';
import { ApiConfigOptions } from '../../config/app-config.interface';
import { isTesting } from './utils';

/**
 * @description
 * Defines a rate limiter with the given configuration.
 *
 * @remarks
 * - rate limiting is skipped when the application runs in testing env
 */
export function defineRateLimiter(options: Partial<Options>, apiOptions: ApiConfigOptions) {
    const skipRateLimit: NonNullable<Options['skip']> = async (req, res) =>
        isTesting() || apiOptions.disableRateLimiting === true || (await options.skip?.(req, res)) === true;

    return rateLimit({
        ...options,
        standardHeaders: true,
        legacyHeaders: false,
        skip: skipRateLimit,
    });
}
