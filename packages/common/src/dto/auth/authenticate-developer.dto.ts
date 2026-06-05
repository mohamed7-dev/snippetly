import z from 'zod';
import { commonErrorsDto } from '../common.dto.js';
import { invalidCredentialsErrorDto, notVerifiedAccountErrorDto } from '../generated-errors-dtos.js';
import { authenticatedUserDto } from './authenticated-user.dto.js';
import { developerAuthInputDto } from './generated-auth-input-dto.js';

const authenticatedDeveloperResponse = z.union([
    authenticatedUserDto,
    invalidCredentialsErrorDto,
    notVerifiedAccountErrorDto,
    ...commonErrorsDto,
]);

/**
 * @description
 * DTOs for admin authentication endpoint
 */
export const authenticateDeveloperDto = {
    body: developerAuthInputDto,
    response: authenticatedDeveloperResponse,
};

export interface AuthenticateDeveloperDtoType {
    body: z.infer<typeof developerAuthInputDto>;
    response: z.infer<typeof authenticatedDeveloperResponse>;
}
