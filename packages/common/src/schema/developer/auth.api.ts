import z from 'zod';
import { authenticatedUser } from '../shared/auth.js';
import { SuccessResponse, successResponse } from '../shared/common-schemas.js';
import { invalidCredentialsError, nativeAuthStrategyError } from '../shared/errors.js';
import { developerAuthInput } from '../shared/generated-auth-input.js';
import {
    missingPasswordError,
    notVerifiedAccountError,
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
