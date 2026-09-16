import z from 'zod';

/**
 * @description
 * Represents the shape of an error that gets thrown when a password is required by the operation, and the user didn't provide one.
 */
export const missingPasswordError = z.object({
    code: z.literal('MISSING_PASSWORD_ERROR'),
    httpStatusCode: z.literal(400),
    message: z.string().nonempty(),
});

export type MissingPasswordError = z.infer<typeof missingPasswordError>;

/**
 * @description
 * Represents the shape of an error that gets thrown when attempting developer account registration where the given password is not valid.
 */
export const passwordValidationError = z.object({
    code: z.literal('PASSWORD_VALIDATION_ERROR'),
    httpStatusCode: z.literal(400),
    message: z.string().nonempty(),
    validationErrorMessage: z.string(),
});

export type PasswordValidationError = z.infer<typeof passwordValidationError>;

/**
 * @description
 * Represents the shape of an error that gets thrown when the `requireVerification` option is set to true while an unverified user attempts authentication.
 */
export const notVerifiedAccountError = z.object({
    code: z.literal('NOT_VERIFIED_ACCOUNT_ERROR'),
    httpStatusCode: z.literal(403),
    message: z.string().nonempty(),
});

export type NotVerifiedAccountError = z.infer<typeof notVerifiedAccountError>;

/**
 * @description
 * Represents the shape of an error that gets thrown when verification token used to verify the developer's account is invalid.
 */
export const verificationTokenInvalidError = z.object({
    code: z.literal('VERIFICATION_TOKEN_INVALID_ERROR'),
    httpStatusCode: z.literal(400),
    message: z.string().nonempty(),
});

/**
 * @description
 * Represents the shape of an error that gets thrown when verification token used to verify the developer's account is valid, but expired.
 */
export const verificationTokenExpiredError = z.object({
    code: z.literal('VERIFICATION_TOKEN_EXPIRED_ERROR'),
    httpStatusCode: z.literal(401),
    message: z.string().nonempty(),
});
