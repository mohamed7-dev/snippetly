import { Handler } from 'express';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';

export function i18n(): Handler {
    return i18nextMiddleware.handle(i18next);
}
