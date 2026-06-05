import { LogLevel } from './types.js';

/**
 * @description
 * An abstract base class for errors that support localization.
 *
 * Instead of treating the `message` as a final user-facing string, this class
 * allows it to act as a translation key, while `variables` provide dynamic
 * values to be interpolated into the localized message.
 *
 * This pattern enables consistent internationalization (i18n) across the API,
 * where error messages can be translated on the client or server based on
 * the active locale.
 *
 * @remarks
 * - `message` should typically be a stable translation key rather than a raw string.
 * - `variables` are optional and used to inject runtime values into the translated message.
 * - Being abstract enforces the creation of domain-specific error types
 *   (e.g., `InvalidCredentialsError`, etc.).
 *
 * @example
 * ```ts
 * export class InvalidCredentialsError extends I18nError {
 *     constructor() {
 *         super('errors.invalidCredentials');
 *     }
 * }
 * ```
 */
export abstract class I18nError extends Error {
    protected constructor(
        /**
         * @description
         * A translation key representing the error message.
         * This key is resolved into a localized string at runtime.
         */
        public message: string,

        /**
         * @description
         * A map of variables used for interpolation within the localized message.
         * Keys correspond to placeholders in the translation string.
         */
        public variables: { [key: string]: string | number } = {},

        /**
         * @description
         * An http status code.
         */
        public statusCode: number,

        /**
         * @description
         * A custom error code.
         */
        public code?: string,

        /**
         * @description
         * The log level for this error.
         */
        public logLevel: LogLevel = LogLevel.warn,
    ) {
        super(message);
    }
}
