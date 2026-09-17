import z from 'zod';
import { authenticatedUser } from '../shared/auth.js';
import { SuccessResponse, successResponse } from '../shared/common-schemas.js';
import {
    emailAddressConflictError,
    invalidCredentialsError,
    nativeAuthStrategyError,
} from '../shared/errors.js';
import { developerAuthInput } from '../shared/generated-auth-input.js';
import {
    identifierChangeTokenExpiredError,
    identifierChangeTokenInvalidError,
    missingPasswordError,
    notVerifiedAccountError,
    passwordResetTokenExpiredError,
    passwordResetTokenInvalidError,
    passwordValidationError,
    verificationTokenExpiredError,
    verificationTokenInvalidError,
} from './errors.js';

//############################### Register ###############################

const registerDeveloperAccountInput = z.object({
    emailAddress: z.email().nonempty(),
    password: z.string().nonempty(), // TODO: make sure it's strong password
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
});

const registerDeveloperAccountOutput = z.union([
    successResponse,
    nativeAuthStrategyError,
    missingPasswordError,
    passwordValidationError,
]);

/**
 * @description
 * DTOs for developer registration endpoint
 */
export const registerDeveloperAccountDto = {
    input: registerDeveloperAccountInput,
    output: registerDeveloperAccountOutput,
};

export interface RegisterDeveloperAccountDtoType {
    input: z.infer<typeof registerDeveloperAccountInput>;
    output: z.infer<typeof registerDeveloperAccountOutput>;
}

//############################### Authenticate ###############################

const authenticateDeveloperOutput = z.union([
    authenticatedUser,
    invalidCredentialsError,
    notVerifiedAccountError,
]);

/**
 * @description
 * DTOs for developer authentication endpoint
 */
export const authenticateDeveloperDto = {
    input: developerAuthInput,
    output: authenticateDeveloperOutput,
};

export interface AuthenticateDeveloperDtoType {
    input: z.infer<typeof developerAuthInput>;
    output: z.infer<typeof authenticateDeveloperOutput>;
}

//############################ Logout ##################################

export const logoutDeveloperDto = {
    output: successResponse,
};

export type LogoutDeveloperDtoType = {
    output: SuccessResponse;
};

//############################ Refresh Verification Token ##################################
const refreshVerificationTokenInput = z.object({
    emailAddress: z.email().nonempty(),
});

const refreshVerificationTokenOutput = z.union([nativeAuthStrategyError, successResponse]);

export const refreshVerificationTokenDto = {
    input: refreshVerificationTokenInput,
    output: refreshVerificationTokenOutput,
};

export type RefreshVerificationTokenDtoType = {
    input: z.infer<typeof refreshVerificationTokenInput>;
    output: z.infer<typeof refreshVerificationTokenOutput>;
};

//############################ Verify Account ##################################

const verifyAccountInput = z.object({
    token: z.string().nonempty(),
});

const verifyAccountOutput = z.union([
    nativeAuthStrategyError,
    authenticatedUser,
    verificationTokenExpiredError,
    verificationTokenInvalidError,
]);

export const verifyAccountDto = {
    input: verifyAccountInput,
    output: verifyAccountOutput,
};

export type VerifyAccountDtoType = {
    input: z.infer<typeof verifyAccountInput>;
    output: z.infer<typeof verifyAccountOutput>;
};

//############################ Request Email Address Change ##################################

const requestEmailAddressChangeInput = z.object({
    newEmailAddress: z.email().nonempty(),
    password: z.string().nonempty(), // TODO: use strong password schema
});

const requestEmailAddressChangeOutput = z.union([
    successResponse,
    nativeAuthStrategyError,
    emailAddressConflictError,
    invalidCredentialsError,
]);

export const requestEmailAddressChangeDto = {
    input: requestEmailAddressChangeInput,
    output: requestEmailAddressChangeOutput,
};

export type RequestEmailAddressChangeDtoType = {
    input: z.infer<typeof requestEmailAddressChangeInput>;
    output: z.infer<typeof requestEmailAddressChangeOutput>;
};

//############################  Change Email Address ##################################

const changeEmailAddressInput = z.object({
    token: z.string().nonempty(),
});

const changeEmailAddressOutput = z.union([
    successResponse,
    nativeAuthStrategyError,
    identifierChangeTokenExpiredError,
    identifierChangeTokenInvalidError,
]);

export const changeEmailAddressDto = {
    input: changeEmailAddressInput,
    output: changeEmailAddressOutput,
};

export type ChangeEmailAddressDtoType = {
    input: z.infer<typeof changeEmailAddressInput>;
    output: z.infer<typeof changeEmailAddressOutput>;
};

//############################ Request Password Reset ##################################

const requestPasswordResetInput = z.object({
    emailAddress: z.email().nonempty(),
});

const requestPasswordResetOutput = z.union([successResponse, nativeAuthStrategyError]);

export const requestPasswordResetDto = {
    input: requestPasswordResetInput,
    output: requestPasswordResetOutput,
};

export type RequestPasswordResetDtoType = {
    input: z.infer<typeof requestPasswordResetInput>;
    output: z.infer<typeof requestPasswordResetOutput>;
};

//############################  Reset Password ##################################

const resetPasswordInput = z.object({
    token: z.string().nonempty(),
    newPassword: z.string().nonempty(), // TODO: use strong password schema
});

const resetPasswordOutput = z.union([
    authenticatedUser,
    nativeAuthStrategyError,
    notVerifiedAccountError,
    passwordValidationError,
    passwordResetTokenExpiredError,
    passwordResetTokenInvalidError,
]);

export const resetPasswordDto = {
    input: resetPasswordInput,
    output: resetPasswordOutput,
};

export type ResetPasswordDtoType = {
    input: z.infer<typeof resetPasswordInput>;
    output: z.infer<typeof resetPasswordOutput>;
};

//############################  Update Password ##################################

const updateDeveloperPasswordInput = z.object({
    newPassword: z.string().nonempty(), // TODO: use strong password schema
    currentPassword: z.string().nonempty(), // TODO: use strong password schema
});

const updateDeveloperPasswordOutput = z.union([
    successResponse,
    nativeAuthStrategyError,
    passwordValidationError,
    invalidCredentialsError,
]);

export const updatePasswordDto = {
    input: updateDeveloperPasswordInput,
    output: updateDeveloperPasswordOutput,
};

export type UpdatePasswordDtoType = {
    input: z.infer<typeof updateDeveloperPasswordInput>;
    output: z.infer<typeof updateDeveloperPasswordOutput>;
};
