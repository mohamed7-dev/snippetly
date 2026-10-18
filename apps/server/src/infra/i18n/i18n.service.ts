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
        let translatedMessage = error.message;
        try {
            translatedMessage = req.t(error.message, error.variables);
            translatedMessage = interpolateLegacyPlaceholders(translatedMessage, error.variables);
        } catch (translationError: unknown) {
            const errorMessage =
                translationError instanceof Error
                    ? translationError.message
                    : JSON.stringify(translationError);
            translatedMessage += `([ErrorTranslationFailure]: ${errorMessage})`;
        }
        return { ...error, message: translatedMessage };
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

function interpolateLegacyPlaceholders(
    message: string,
    variables: Record<string, string | number>,
): string {
    return message.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (placeholder, key: string) => {
        const value = variables[key];
        return value === undefined ? placeholder : String(value);
    });
}
