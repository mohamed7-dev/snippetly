import z from 'zod';
import { commonErrorsDto } from '../common.dto.js';
import {
    missingPasswordErrorDto,
    nativeAuthStrategyErrorDto,
    passwordValidationErrorDto,
} from '../generated-errors-dtos.js';
import { successResponseDto } from '../success-response.dto.js';

const registerDeveloperAccountReqSchema = z.object({
    emailAddress: z.email(),
    password: z.string(), // TODO: make sure it's strong password
    firstName: z.string(),
    lastName: z.string(),
});

const registerDeveloperAccountResSchema = z.union([
    successResponseDto,
    missingPasswordErrorDto,
    passwordValidationErrorDto,
    nativeAuthStrategyErrorDto,
    ...commonErrorsDto,
]);

/**
 * @description
 * DTOs for developer registration endpoint
 */
export const registerDeveloperAccountDto = {
    body: registerDeveloperAccountReqSchema,
    response: registerDeveloperAccountResSchema,
};

export interface RegisterDeveloperAccountDtoType {
    body: z.infer<typeof registerDeveloperAccountReqSchema>;
    response: z.infer<typeof registerDeveloperAccountResSchema>;
}
