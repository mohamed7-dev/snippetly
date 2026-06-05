import { ApiError, I18nError } from '@snippetly/common/errors';
import { LANGUAGE_CODE_QUERY_NAME } from '@snippetly/common/lib';
import { Handler, Request } from 'express';
import i18next from 'i18next';
import BackendFS from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import ICU from 'i18next-icu';
import path from 'node:path';
import { Injectable } from '../ioc-container/injectable.decorator';

@Injectable()
export class I18nService {
    public getMiddleware(): Handler {
        return i18nextMiddleware.handle(i18next) as Handler;
    }

    public async initialize(): Promise<void> {
        await i18next
            .use(i18nextMiddleware.LanguageDetector)
            .use(BackendFS)
            .use(ICU)
            .init({
                preload: ['en', 'ar'],
                fallbackLng: 'en',
                detection: {
                    lookupQuerystring: LANGUAGE_CODE_QUERY_NAME,
                },
                backend: {
                    loadPath: path.join(__dirname, 'dictionaries/{{lng}}.json'),
                    jsonIndent: 2,
                },
                nsSeparator: false,
            });
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
     * Translates the message of any error type that implements the {@link ApiError} interface of the API.
     */
    public translateApiError(apiError: ApiError, req: Request) {
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
