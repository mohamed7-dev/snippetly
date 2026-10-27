import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
    authenticateDeveloperDto,
    changeEmailAddressDto,
    developerUserMeDto,
    listActiveSessionsDto,
    logoutDeveloperDto,
    refreshVerificationTokenDto,
    registerDeveloperAccountDto,
    requestEmailAddressChangeDto,
    requestPasswordResetDto,
    resetPasswordDto,
    revokeSessionDto,
    updatePasswordDto,
    verifyAccountDto,
} from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperAuthOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'post',
        path: '/developer/auth/accounts',
        tag: 'Authentication',
        summary: 'Register a developer account',
        body: registerDeveloperAccountDto.input,
        response: registerDeveloperAccountDto.output,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/auth/accounts/me',
        tag: 'Authentication',
        summary: 'Update the current account password',
        body: updatePasswordDto.input,
        response: updatePasswordDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/auth/accounts/me',
        tag: 'Authentication',
        summary: 'Get the current authenticated account',
        response: developerUserMeDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'post',
        path: '/developer/auth/sessions',
        tag: 'Authentication',
        summary: 'Authenticate a developer',
        body: authenticateDeveloperDto.input,
        response: authenticateDeveloperDto.output,
        sessionTokenHeaderDescription:
            'Returned after successful sign-in. Send this value as a Bearer token in the Authorization header on authenticated requests.',
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/auth/sessions/current',
        tag: 'Authentication',
        summary: 'Log out the current session',
        response: logoutDeveloperDto.output,
        optionalAuthentication: true,
        sessionTokenHeaderDescription:
            'Returned as an empty value when a session token was provided and cleared. No header is returned when the request has no session token.',
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/auth/sessions',
        tag: 'Authentication',
        summary: 'Lists all active sessions of the current user',
        response: listActiveSessionsDto.output,
        optionalAuthentication: false,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/auth/sessions/{id}',
        tag: 'Authentication',
        summary: 'Revokes session',
        response: revokeSessionDto.output,
        params: revokeSessionDto.input,
        optionalAuthentication: false,
        authenticated: true,
        sessionTokenHeaderDescription:
            'Returned as an empty value only when the revoked session is the current session. Otherwise, no session token header is returned.',
    });

    registerRoute(registry, {
        method: 'post',
        path: '/developer/auth/verification-tokens',
        tag: 'Authentication',
        summary: 'Request an email verification token',
        body: refreshVerificationTokenDto.input,
        response: refreshVerificationTokenDto.output,
    });

    registerRoute(registry, {
        method: 'post',
        path: '/developer/auth/account-verifications',
        tag: 'Authentication',
        summary: 'Verify a developer account',
        body: verifyAccountDto.input,
        response: verifyAccountDto.output,
        sessionTokenHeaderDescription:
            'Returned after successful verification, which also signs the developer in. Send this value as a Bearer token in the Authorization header on authenticated requests.',
    });

    registerRoute(registry, {
        method: 'post',
        path: '/developer/auth/account-email-address-change',
        tag: 'Authentication',
        summary: 'Request an email address change',
        body: requestEmailAddressChangeDto.input,
        response: requestEmailAddressChangeDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/auth/account-email-address-change',
        tag: 'Authentication',
        summary: 'Confirm an email address change',
        body: changeEmailAddressDto.input,
        response: changeEmailAddressDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'post',
        path: '/developer/auth/account-password-change',
        tag: 'Authentication',
        summary: 'Request a password reset',
        body: requestPasswordResetDto.input,
        response: requestPasswordResetDto.output,
    });

    registerRoute(registry, {
        method: 'patch',
        path: '/developer/auth/account-password-change',
        tag: 'Authentication',
        summary: 'Reset the account password',
        body: resetPasswordDto.input,
        response: resetPasswordDto.output,
        sessionTokenHeaderDescription:
            'Returned after a successful password reset and sign-in. Send this value as a Bearer token in the Authorization header on authenticated requests.',
    });
}
