import z from 'zod';
import { authenticatedUser } from '../shared/auth.js';
import { InferDtoType, passwordSchema, successResponse } from '../shared/common-schemas.js';
import {
    emailAddressConflictError,
    forbiddenErrorSchema,
    invalidCredentialsError,
    nativeAuthStrategyError,
    unverifiedExternalEmailErrorSchema,
    userInputErrorSchema,
    withServerErrors,
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
    password: passwordSchema,
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    isPrivate: z.boolean().optional(),
});
const registerDeveloperAccountOutput = withServerErrors(
    z.union([
        successResponse,
        nativeAuthStrategyError,
        missingPasswordError,
        passwordValidationError,
        emailAddressConflictError,
    ]),
    [userInputErrorSchema],
);

export const registerDeveloperAccountDto = {
    input: registerDeveloperAccountInput,
    output: registerDeveloperAccountOutput,
};

export type RegisterDeveloperAccountDtoType = InferDtoType<typeof registerDeveloperAccountDto>;

//############################### Authenticate ###############################

const authenticateDeveloperOutput = withServerErrors(
    z.union([authenticatedUser, invalidCredentialsError, notVerifiedAccountError]),
    [userInputErrorSchema, unverifiedExternalEmailErrorSchema],
);

export const authenticateDeveloperDto = {
    input: developerAuthInput,
    output: authenticateDeveloperOutput,
};

export type AuthenticateDeveloperDtoType = InferDtoType<typeof authenticateDeveloperDto>;

//############################ Logout ##################################

const logoutDeveloperOutput = withServerErrors(successResponse);

export const logoutDeveloperDto = { output: logoutDeveloperOutput };

export type LogoutDeveloperDtoType = InferDtoType<typeof logoutDeveloperDto>;

//############################ Refresh Verification Token ##################################
const refreshVerificationTokenInput = z.object({
    emailAddress: z.email().nonempty(),
});

const refreshVerificationTokenOutput = withServerErrors(z.union([nativeAuthStrategyError, successResponse]), [
    userInputErrorSchema,
]);

export const refreshVerificationTokenDto = {
    input: refreshVerificationTokenInput,
    output: refreshVerificationTokenOutput,
};
export type RefreshVerificationTokenDtoType = InferDtoType<typeof refreshVerificationTokenDto>;

//############################ Verify Account ##################################

const verifyAccountInput = z.object({
    token: z.string().nonempty(),
});

const verifyAccountOutput = withServerErrors(
    z.union([
        nativeAuthStrategyError,
        authenticatedUser,
        verificationTokenExpiredError,
        verificationTokenInvalidError,
    ]),
    [userInputErrorSchema],
);

export const verifyAccountDto = {
    input: verifyAccountInput,
    output: verifyAccountOutput,
};
export type VerifyAccountDtoType = InferDtoType<typeof verifyAccountDto>;

//############################ Request Email Address Change ##################################

const requestEmailAddressChangeInput = z.object({
    newEmailAddress: z.email().nonempty(),
    password: passwordSchema,
});

const requestEmailAddressChangeOutput = withServerErrors(
    z.union([successResponse, nativeAuthStrategyError, emailAddressConflictError, invalidCredentialsError]),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const requestEmailAddressChangeDto = {
    input: requestEmailAddressChangeInput,
    output: requestEmailAddressChangeOutput,
};
export type RequestEmailAddressChangeDtoType = InferDtoType<typeof requestEmailAddressChangeDto>;

//############################  Change Email Address ##################################

const changeEmailAddressInput = z.object({
    token: z.string().nonempty(),
});

const changeEmailAddressOutput = withServerErrors(
    z.union([
        successResponse,
        nativeAuthStrategyError,
        identifierChangeTokenExpiredError,
        identifierChangeTokenInvalidError,
    ]),
    [userInputErrorSchema],
);

export const changeEmailAddressDto = {
    input: changeEmailAddressInput,
    output: changeEmailAddressOutput,
};
export type ChangeEmailAddressDtoType = InferDtoType<typeof changeEmailAddressDto>;

//############################ Request Password Reset ##################################

const requestPasswordResetInput = z.object({
    emailAddress: z.email().nonempty(),
});

const requestPasswordResetOutput = withServerErrors(z.union([successResponse, nativeAuthStrategyError]), [
    userInputErrorSchema,
]);

export const requestPasswordResetDto = {
    input: requestPasswordResetInput,
    output: requestPasswordResetOutput,
};
export type RequestPasswordResetDtoType = InferDtoType<typeof requestPasswordResetDto>;

//############################  Reset Password ##################################

const resetPasswordInput = z.object({
    token: z.string().nonempty(),
    newPassword: passwordSchema,
});

const resetPasswordOutput = withServerErrors(
    z.union([
        authenticatedUser,
        nativeAuthStrategyError,
        notVerifiedAccountError,
        passwordValidationError,
        passwordResetTokenExpiredError,
        passwordResetTokenInvalidError,
    ]),
    [userInputErrorSchema],
);

export const resetPasswordDto = {
    input: resetPasswordInput,
    output: resetPasswordOutput,
};
export type ResetPasswordDtoType = InferDtoType<typeof resetPasswordDto>;

//############################  Update Password ##################################

const updateDeveloperPasswordInput = z.object({
    newPassword: passwordSchema,
    currentPassword: passwordSchema,
});

const updateDeveloperPasswordOutput = withServerErrors(
    z.union([successResponse, nativeAuthStrategyError, passwordValidationError, invalidCredentialsError]),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const updatePasswordDto = {
    input: updateDeveloperPasswordInput,
    output: updateDeveloperPasswordOutput,
};
export type UpdatePasswordDtoType = InferDtoType<typeof updatePasswordDto>;

//############################  Me ##################################

const developerUserMeOutput = withServerErrors(authenticatedUser.nullable(), [forbiddenErrorSchema]);

export const developerUserMeDto = {
    input: z.null(),
    output: developerUserMeOutput,
};
export type DeveloperUserMeDtoType = InferDtoType<typeof developerUserMeDto>;
