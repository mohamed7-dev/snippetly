import { ApiError } from './api-error.js';
import { Schemable } from './types.js';

export class MissingPasswordError extends ApiError implements Schemable {
    readonly code = 'MISSING_PASSWORD_ERROR' as any;
    readonly message = 'MISSING_PASSWORD_ERROR';
    readonly statusCode = 400;

    constructor() {
        super();
    }

    defineSchema() {
        return `z.object({
            code: z.literal('MISSING_PASSWORD_ERROR'),
            statusCode: z.literal(400),
            message: z.string(),
        });`;
    }
}

export class PasswordValidationError extends ApiError implements Schemable {
    readonly code = 'PASSWORD_VALIDATION_ERROR' as any;
    readonly message = 'PASSWORD_VALIDATION_ERROR';
    readonly statusCode = 400;

    constructor(public validationErrorMessage: string) {
        super();
    }

    defineSchema() {
        return `z.object({
            code: z.literal('PASSWORD_VALIDATION_ERROR'),
            statusCode: z.literal(400),
            message: z.string(),
            validationErrorMessage:z.string()
        });`;
    }
}
