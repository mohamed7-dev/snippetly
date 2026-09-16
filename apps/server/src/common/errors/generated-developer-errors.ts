/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */
import {
    emailAddressConflictError,
    invalidCredentialsError,
    missingPasswordError,
    nativeAuthStrategyError,
    notVerifiedAccountError,
    passwordValidationError,
} from '@snippetly/common/dto';
import { z } from 'zod';
export class ApiError {
    readonly code: string;
    readonly httpStatusCode: number;
    readonly message: string;
}
type MissingPasswordErrorData = z.infer<typeof missingPasswordError>;

export class MissingPasswordError extends ApiError {
    readonly code: MissingPasswordErrorData['code'] = 'MISSING_PASSWORD_ERROR';
    readonly httpStatusCode: MissingPasswordErrorData['httpStatusCode'] = 400;
    readonly message: MissingPasswordErrorData['message'] = 'MISSING_PASSWORD_ERROR';

    constructor() {
        super();

        Object.setPrototypeOf(this, MissingPasswordError.prototype);
    }
}

type NotVerifiedAccountErrorData = z.infer<typeof notVerifiedAccountError>;

export class NotVerifiedAccountError extends ApiError {
    readonly code: NotVerifiedAccountErrorData['code'] = 'NOT_VERIFIED_ACCOUNT_ERROR';
    readonly httpStatusCode: NotVerifiedAccountErrorData['httpStatusCode'] = 403;
    readonly message: NotVerifiedAccountErrorData['message'] = 'NOT_VERIFIED_ACCOUNT_ERROR';

    constructor() {
        super();

        Object.setPrototypeOf(this, NotVerifiedAccountError.prototype);
    }
}

type PasswordValidationErrorData = z.infer<typeof passwordValidationError>;

export class PasswordValidationError extends ApiError {
    readonly code: PasswordValidationErrorData['code'] = 'PASSWORD_VALIDATION_ERROR';
    readonly httpStatusCode: PasswordValidationErrorData['httpStatusCode'] = 400;
    readonly message: PasswordValidationErrorData['message'] = 'PASSWORD_VALIDATION_ERROR';
    readonly validationErrorMessage: PasswordValidationErrorData['validationErrorMessage'];

    constructor(data: Omit<PasswordValidationErrorData, 'httpStatusCode' | 'code' | 'message'>) {
        super();
        this.validationErrorMessage = data.validationErrorMessage;
        Object.setPrototypeOf(this, PasswordValidationError.prototype);
    }
}

type EmailAddressConflictErrorData = z.infer<typeof emailAddressConflictError>;

export class EmailAddressConflictError extends ApiError {
    readonly code: EmailAddressConflictErrorData['code'] = 'EMAIL_ADDRESS_CONFLICT_ERROR';
    readonly httpStatusCode: EmailAddressConflictErrorData['httpStatusCode'] = 409;
    readonly message: EmailAddressConflictErrorData['message'] = 'EMAIL_ADDRESS_CONFLICT_ERROR';

    constructor() {
        super();

        Object.setPrototypeOf(this, EmailAddressConflictError.prototype);
    }
}

type InvalidCredentialsErrorData = z.infer<typeof invalidCredentialsError>;

export class InvalidCredentialsError extends ApiError {
    readonly code: InvalidCredentialsErrorData['code'] = 'INVALID_CREDENTIALS_ERROR';
    readonly httpStatusCode: InvalidCredentialsErrorData['httpStatusCode'] = 401;
    readonly message: InvalidCredentialsErrorData['message'] = 'INVALID_CREDENTIALS_ERROR';
    readonly reason: InvalidCredentialsErrorData['reason'];

    constructor(data: Omit<InvalidCredentialsErrorData, 'httpStatusCode' | 'code' | 'message'>) {
        super();
        this.reason = data.reason;
        Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    }
}

type NativeAuthStrategyErrorData = z.infer<typeof nativeAuthStrategyError>;

export class NativeAuthStrategyError extends ApiError {
    readonly code: NativeAuthStrategyErrorData['code'] = 'NATIVE_AUTH_STRATEGY_ERROR';
    readonly httpStatusCode: NativeAuthStrategyErrorData['httpStatusCode'] = 500;
    readonly message: NativeAuthStrategyErrorData['message'] = 'NATIVE_AUTH_STRATEGY_ERROR';

    constructor() {
        super();

        Object.setPrototypeOf(this, NativeAuthStrategyError.prototype);
    }
}
