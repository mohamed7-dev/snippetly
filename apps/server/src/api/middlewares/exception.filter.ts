import { NextFunction, Request, Response } from 'express';
import { InternalServerError } from '../../common/errors/errors';
import { ApiError } from '../../common/errors/generated-developer-errors';
import { I18nError } from '../../infra/i18n/i18n-error';
import { I18nService } from '../../infra/i18n/i18n.service';
import { iocContainer } from '../../infra/ioc-container/ioc-container';

export function exceptionFilter(err: unknown, req: Request, res: Response, _next: NextFunction) {
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
