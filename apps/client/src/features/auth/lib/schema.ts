import {
    authenticateDeveloperDto,
    refreshVerificationTokenDto,
    registerDeveloperAccountDto,
    requestPasswordResetDto,
    resetPasswordDto,
    type AuthenticateDeveloperDtoType,
    type RefreshVerificationTokenDtoType,
    type RegisterDeveloperAccountDtoType,
    type RequestPasswordResetDtoType,
    type ResetPasswordDtoType,
} from '@snippetly/common/dto';

// Registration -> Developer
export const developerAccountRegistrationFormSchema = registerDeveloperAccountDto.input;
export type DeveloperAccountRegistrationFormSchema = RegisterDeveloperAccountDtoType['input'];

// Authentication -> Developer
export const developerAuthenticationFormSchema = authenticateDeveloperDto.input;
export type DeveloperAuthenticationFormSchema = AuthenticateDeveloperDtoType['input'];

// RequestPasswordReset -> Developer
export const developerPasswordResetRequestFormSchema = requestPasswordResetDto.input;
export type DeveloperPasswordResetRequestFormSchema = RequestPasswordResetDtoType['input'];

// ResetPassword -> Developer
export const developerResetPasswordFormSchema = resetPasswordDto.input;
export type DeveloperResetPasswordFormSchema = ResetPasswordDtoType['input'];

// RefreshAccountVerificationToken -> Developer
export const refreshAccountVerificationTokenFormSchema = refreshVerificationTokenDto.input;
export type RefreshAccountVerificationTokenFormSchemaType = RefreshVerificationTokenDtoType['input'];
