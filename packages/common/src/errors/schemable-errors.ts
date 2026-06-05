import * as commonExceptions from './common-api-errors.js';
import * as developerApiError from './developer-api-errors.js';
import * as unexpectedErrors from './errors.js';

export const schemableErrors = [
    ...Object.values(unexpectedErrors),
    ...Object.values(commonExceptions),
    ...Object.values(developerApiError),
] as const;
