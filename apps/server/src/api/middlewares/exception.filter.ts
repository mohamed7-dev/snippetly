import { Request, Response } from 'express';
import { InternalServerError, RateLimiterError } from '../../common/errors/errors';
import { ApiError } from '../../common/errors/generated-developer-errors';
import { I18nError } from '../../infra/i18n/i18n-error';
import { I18nService } from '../../infra/i18n/i18n.service';
import { iocContainer } from '../../infra/ioc-container/ioc-container';

function isRateLimiterError(err: unknown): err is RateLimiterError {
    if (err instanceof RateLimiterError) return true;

    if (typeof err !== 'object' || err === null) return false;

    const rateLimitError = err as {
        statusCode?: number;
        code?: string;
        name?: string;
        message?: string;
    };

    return (
        rateLimitError.statusCode === 429 ||
        rateLimitError.code === 'RATE_LIMITER_ERROR' ||
        rateLimitError.name === 'RateLimitError' ||
        (typeof rateLimitError.message === 'string' &&
            rateLimitError.message.toLowerCase().includes('too many requests'))
    );
}

export function exceptionFilter(err: unknown, req: Request, res: Response) {
    console.log(err);
    const i18nService = iocContainer.resolve<I18nService>(I18nService);
    if (err instanceof I18nError) {
        const translated = i18nService.translateError(err, req);
        const { logLevel, ...errorData } = err;
        return res.status(errorData.httpStatusCode).json({
            ...errorData,
            message: translated.message,
        });
    } else if (err instanceof ApiError) {
        const translated = i18nService.translateApiError(err, req);
        return res.status(err.httpStatusCode).json({
            ...err,
            message: translated.message,
        });
    } else if (isRateLimiterError(err)) {
        const rateLimiterError = new RateLimiterError();
        const translated = i18nService.translateError(rateLimiterError, req);

        return res.status(rateLimiterError.httpStatusCode).json({
            code: rateLimiterError.code,
            httpStatusCode: rateLimiterError.httpStatusCode,
            message: translated.message,
        });
    } else {
        const internalServerError = new InternalServerError('errors.internal-server-error');

        const translated = i18nService.translateError(internalServerError, req);

        return res.status(internalServerError.httpStatusCode).json({
            code: internalServerError.code,
            httpStatusCode: internalServerError.httpStatusCode,
            message: translated.message,
        });
    }
}
