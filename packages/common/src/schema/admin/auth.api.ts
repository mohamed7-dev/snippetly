import z from 'zod';
import { authenticatedUser } from '../shared/auth.js';
import { InferDtoType, successResponse } from '../shared/common-schemas.js';
import {
    forbiddenErrorSchema,
    invalidCredentialsError,
    userInputErrorSchema,
    withServerErrors,
} from '../shared/errors.js';
import { adminAuthInput } from '../shared/generated-auth-input.js';

//############################### Authenticate ###############################

const authenticateAdminOutput = withServerErrors(z.union([authenticatedUser, invalidCredentialsError]), [
    userInputErrorSchema,
]);

export const authenticateAdminDto = {
    input: adminAuthInput,
    output: authenticateAdminOutput,
};

export type AuthenticateAdminDtoType = InferDtoType<typeof authenticateAdminDto>;

//############################ Logout ##################################

const logoutAdminOutput = withServerErrors(successResponse, [forbiddenErrorSchema]);

export const logoutAdminDto = { output: logoutAdminOutput };

export type LogoutAdminDtoType = InferDtoType<typeof logoutAdminDto>;
