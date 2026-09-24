import rateLimit, { Options } from 'express-rate-limit';
import { ApiConfigOptions } from '../../config/app-config.interface';
import { isTesting } from './utils';

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
