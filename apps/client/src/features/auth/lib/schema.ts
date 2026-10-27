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
export const accountRegistrationFormSchema = registerDeveloperAccountDto.input;
export type AccountRegistrationFormSchema = RegisterDeveloperAccountDtoType['input'];

// Authentication -> Developer
export const developerAuthenticationFormSchema = authenticateDeveloperDto.input;
export type DeveloperAuthenticationFormSchema = AuthenticateDeveloperDtoType['input'];

// RequestPasswordReset -> Developer
export const passwordResetRequestFormSchema = requestPasswordResetDto.input;
export type PasswordResetRequestFormSchema = RequestPasswordResetDtoType['input'];

// ResetPassword -> Developer
export const resetPasswordFormSchema = resetPasswordDto.input;
export type ResetPasswordFormSchema = ResetPasswordDtoType['input'];

// RefreshAccountVerificationToken -> Developer
export const refreshAccountVerificationTokenFormSchema = refreshVerificationTokenDto.input;
export type RefreshAccountVerificationTokenFormSchemaType = RefreshVerificationTokenDtoType['input'];
