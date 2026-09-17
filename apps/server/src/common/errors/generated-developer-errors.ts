/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */
import { z } from "zod"
import { identifierChangeTokenExpiredError,identifierChangeTokenInvalidError,invalidFriendshipActionError,missingPasswordError,notVerifiedAccountError,passwordResetTokenExpiredError,passwordResetTokenInvalidError,passwordValidationError,verificationTokenExpiredError,verificationTokenInvalidError,emailAddressConflictError,invalidCredentialsError,nativeAuthStrategyError } from "@snippetly/common/dto"
 export class ApiError {
  readonly code: string;
  readonly httpStatusCode: number;
  readonly message: string;
}
type IdentifierChangeTokenExpiredErrorData = z.infer<typeof identifierChangeTokenExpiredError>;

export class IdentifierChangeTokenExpiredError extends ApiError {
    readonly code:IdentifierChangeTokenExpiredErrorData["code"] = 'IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR';
    readonly httpStatusCode:IdentifierChangeTokenExpiredErrorData["httpStatusCode"] = 401;
    readonly message:IdentifierChangeTokenExpiredErrorData["message"] = 'IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, IdentifierChangeTokenExpiredError.prototype);
  }
}
    
type IdentifierChangeTokenInvalidErrorData = z.infer<typeof identifierChangeTokenInvalidError>;

export class IdentifierChangeTokenInvalidError extends ApiError {
    readonly code:IdentifierChangeTokenInvalidErrorData["code"] = 'IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR';
    readonly httpStatusCode:IdentifierChangeTokenInvalidErrorData["httpStatusCode"] = 401;
    readonly message:IdentifierChangeTokenInvalidErrorData["message"] = 'IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, IdentifierChangeTokenInvalidError.prototype);
  }
}
    
type InvalidFriendshipActionErrorData = z.infer<typeof invalidFriendshipActionError>;

export class InvalidFriendshipActionError extends ApiError {
    readonly code:InvalidFriendshipActionErrorData["code"] = 'INVALID_FRIENDSHIP_ACTION_ERROR';
    readonly httpStatusCode:InvalidFriendshipActionErrorData["httpStatusCode"] = 400;
    readonly message:InvalidFriendshipActionErrorData["message"] = 'INVALID_FRIENDSHIP_ACTION_ERROR';
      readonly reason: InvalidFriendshipActionErrorData["reason"];

    constructor( data: Omit<InvalidFriendshipActionErrorData,"httpStatusCode" | "code" | "message">) {
        super();
        this.reason = data.reason;
        Object.setPrototypeOf(this, InvalidFriendshipActionError.prototype);
  }
}
    
type MissingPasswordErrorData = z.infer<typeof missingPasswordError>;

export class MissingPasswordError extends ApiError {
    readonly code:MissingPasswordErrorData["code"] = 'MISSING_PASSWORD_ERROR';
    readonly httpStatusCode:MissingPasswordErrorData["httpStatusCode"] = 400;
    readonly message:MissingPasswordErrorData["message"] = 'MISSING_PASSWORD_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, MissingPasswordError.prototype);
  }
}
    
type NotVerifiedAccountErrorData = z.infer<typeof notVerifiedAccountError>;

export class NotVerifiedAccountError extends ApiError {
    readonly code:NotVerifiedAccountErrorData["code"] = 'NOT_VERIFIED_ACCOUNT_ERROR';
    readonly httpStatusCode:NotVerifiedAccountErrorData["httpStatusCode"] = 403;
    readonly message:NotVerifiedAccountErrorData["message"] = 'NOT_VERIFIED_ACCOUNT_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, NotVerifiedAccountError.prototype);
  }
}
    
type PasswordResetTokenExpiredErrorData = z.infer<typeof passwordResetTokenExpiredError>;

export class PasswordResetTokenExpiredError extends ApiError {
    readonly code:PasswordResetTokenExpiredErrorData["code"] = 'PASSWORD_RESET_TOKEN_EXPIRED_ERROR';
    readonly httpStatusCode:PasswordResetTokenExpiredErrorData["httpStatusCode"] = 401;
    readonly message:PasswordResetTokenExpiredErrorData["message"] = 'PASSWORD_RESET_TOKEN_EXPIRED_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, PasswordResetTokenExpiredError.prototype);
  }
}
    
type PasswordResetTokenInvalidErrorData = z.infer<typeof passwordResetTokenInvalidError>;

export class PasswordResetTokenInvalidError extends ApiError {
    readonly code:PasswordResetTokenInvalidErrorData["code"] = 'PASSWORD_RESET_TOKEN_INVALID_ERROR';
    readonly httpStatusCode:PasswordResetTokenInvalidErrorData["httpStatusCode"] = 401;
    readonly message:PasswordResetTokenInvalidErrorData["message"] = 'PASSWORD_RESET_TOKEN_INVALID_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, PasswordResetTokenInvalidError.prototype);
  }
}
    
type PasswordValidationErrorData = z.infer<typeof passwordValidationError>;

export class PasswordValidationError extends ApiError {
    readonly code:PasswordValidationErrorData["code"] = 'PASSWORD_VALIDATION_ERROR';
    readonly httpStatusCode:PasswordValidationErrorData["httpStatusCode"] = 400;
    readonly message:PasswordValidationErrorData["message"] = 'PASSWORD_VALIDATION_ERROR';
      readonly validationErrorMessage: PasswordValidationErrorData["validationErrorMessage"];

    constructor( data: Omit<PasswordValidationErrorData,"httpStatusCode" | "code" | "message">) {
        super();
        this.validationErrorMessage = data.validationErrorMessage;
        Object.setPrototypeOf(this, PasswordValidationError.prototype);
  }
}
    
type VerificationTokenExpiredErrorData = z.infer<typeof verificationTokenExpiredError>;

export class VerificationTokenExpiredError extends ApiError {
    readonly code:VerificationTokenExpiredErrorData["code"] = 'VERIFICATION_TOKEN_EXPIRED_ERROR';
    readonly httpStatusCode:VerificationTokenExpiredErrorData["httpStatusCode"] = 401;
    readonly message:VerificationTokenExpiredErrorData["message"] = 'VERIFICATION_TOKEN_EXPIRED_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, VerificationTokenExpiredError.prototype);
  }
}
    
type VerificationTokenInvalidErrorData = z.infer<typeof verificationTokenInvalidError>;

export class VerificationTokenInvalidError extends ApiError {
    readonly code:VerificationTokenInvalidErrorData["code"] = 'VERIFICATION_TOKEN_INVALID_ERROR';
    readonly httpStatusCode:VerificationTokenInvalidErrorData["httpStatusCode"] = 401;
    readonly message:VerificationTokenInvalidErrorData["message"] = 'VERIFICATION_TOKEN_INVALID_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, VerificationTokenInvalidError.prototype);
  }
}
    
type EmailAddressConflictErrorData = z.infer<typeof emailAddressConflictError>;

export class EmailAddressConflictError extends ApiError {
    readonly code:EmailAddressConflictErrorData["code"] = 'EMAIL_ADDRESS_CONFLICT_ERROR';
    readonly httpStatusCode:EmailAddressConflictErrorData["httpStatusCode"] = 409;
    readonly message:EmailAddressConflictErrorData["message"] = 'EMAIL_ADDRESS_CONFLICT_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, EmailAddressConflictError.prototype);
  }
}
    
type InvalidCredentialsErrorData = z.infer<typeof invalidCredentialsError>;

export class InvalidCredentialsError extends ApiError {
    readonly code:InvalidCredentialsErrorData["code"] = 'INVALID_CREDENTIALS_ERROR';
    readonly httpStatusCode:InvalidCredentialsErrorData["httpStatusCode"] = 401;
    readonly message:InvalidCredentialsErrorData["message"] = 'INVALID_CREDENTIALS_ERROR';
      readonly reason: InvalidCredentialsErrorData["reason"];

    constructor( data: Omit<InvalidCredentialsErrorData,"httpStatusCode" | "code" | "message">) {
        super();
        this.reason = data.reason;
        Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}
    
type NativeAuthStrategyErrorData = z.infer<typeof nativeAuthStrategyError>;

export class NativeAuthStrategyError extends ApiError {
    readonly code:NativeAuthStrategyErrorData["code"] = 'NATIVE_AUTH_STRATEGY_ERROR';
    readonly httpStatusCode:NativeAuthStrategyErrorData["httpStatusCode"] = 500;
    readonly message:NativeAuthStrategyErrorData["message"] = 'NATIVE_AUTH_STRATEGY_ERROR';
    

    constructor( ) {
        super();
    
        Object.setPrototypeOf(this, NativeAuthStrategyError.prototype);
  }
}
    