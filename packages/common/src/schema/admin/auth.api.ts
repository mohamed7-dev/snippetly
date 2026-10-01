import z from 'zod';
import { authenticatedUser } from '../shared/auth.js';
import { SuccessResponse, successResponse } from '../shared/common-schemas.js';
import { invalidCredentialsError } from '../shared/errors.js';
import { adminAuthInput } from '../shared/generated-auth-input.js';

//############################### Authenticate ###############################

const authenticateAdminOutput = z.union([authenticatedUser, invalidCredentialsError]);

export const authenticateAdminDto = {
    input: adminAuthInput,
    output: authenticateAdminOutput,
};

export interface AuthenticateAdminDtoType {
    input: z.infer<typeof adminAuthInput>;
    output: z.infer<typeof authenticateAdminOutput>;
}

//############################ Logout ##################################

export const logoutAdminDto = {
    output: successResponse,
};

export type LogoutAdminDtoType = {
    output: SuccessResponse;
};
