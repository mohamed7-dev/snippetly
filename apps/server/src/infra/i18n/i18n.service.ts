import { Handler, Request } from 'express';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import { AppApiError } from '../../common/errors/api-error';
import { Injectable } from '../ioc-container/injectable.decorator';
import { I18nError } from './i18n-error';

@Injectable()
export class I18nService {
    public getMiddleware(): Handler {
        return i18nextMiddleware.handle(i18next) as Handler;
    }

    /**
     * @description
     * Translates the message of any error class that extends the {@link I18nError} class.
     */
    public translateError(error: I18nError, req: Request) {
        const originalError = error;

        if (error instanceof I18nError) {
            let translatedMessage = error.message;
            try {
                const key = originalError.message;
                translatedMessage = req.t(key, originalError.variables);
            } catch (error: any) {
                translatedMessage += `([ErrorTranslationFailure]: ${typeof error.message === 'string' ? error.message : JSON.stringify(error.message)})`;
            }
            error.message = translatedMessage;
            delete (originalError as any).variables;
        }
        return error;
    }

    /**
     * @description
     * Translates the message of any error type that implements the {@link AppApiError} interface of the API.
     */
    public translateApiError(apiError: AppApiError, req: Request) {
        let translatedMessage = apiError.message;
        try {
            const key = `apiErrors.${apiError.message}`;
            translatedMessage = req.t(key);
        } catch (error: any) {
            translatedMessage += `([ErrorTranslationFailure]: ${typeof error.message === 'string' ? error.message : JSON.stringify(error.message)})`;
        }
        apiError.message = translatedMessage;
        return apiError;
    }
}
