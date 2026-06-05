import { ApiError, I18nError, InternalServerError } from '@snippetly/common/errors';
import { NextFunction, Request, Response } from 'express';
import { I18nService } from '../../infra/i18n/i18n.service';
import { iocContainer } from '../../infra/ioc-container/ioc-container';

export function exceptionFilter(err: unknown, req: Request, res: Response, _next: NextFunction) {
    const i18nService = iocContainer.resolve<I18nService>(I18nService);

    if (err instanceof I18nError) {
        const translated = i18nService.translateError(err, req);
        const { logLevel, ...errorData } = err;
        return res.status(errorData.statusCode).json({
            ...errorData,
            message: translated.message,
        });
    } else if (err instanceof ApiError) {
        const translated = i18nService.translateApiError(err, req);
        return res.status(err.statusCode).json({
            ...err,
            message: translated.message,
        });
    }

    const internalServerError = new InternalServerError('errors.internal-server-error');

    const translated = i18nService.translateError(internalServerError, req);

    return res.status(internalServerError.statusCode).json({
        code: internalServerError.code,
        statusCode: internalServerError.statusCode,
        message: translated.message,
    });
}
