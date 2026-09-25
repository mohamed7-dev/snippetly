import {
    ChangeEmailAddressDtoType,
    RegisterDeveloperAccountDtoType,
    RequestEmailAddressChangeDtoType,
    RequestPasswordResetDtoType,
    ResetPasswordDtoType,
    UpdatePasswordDtoType,
    VerifyAccountDtoType,
} from '@snippetly/common/dto';
import {
    AccountRegistrationEvent,
    EventBus,
    IdentifierChangedEvent,
    IdentifierChangeRequestedEvent,
    mergeConfig,
    PasswordResetRequestedEvent,
    PasswordValidationError,
    SendEmailOptions,
} from '@snippetly/server';
import { ApiClient, ApiErrorGuard, createApiErrorGuard, createTestEnvironment } from '@snippetly/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { getE2ETestSetupTimeout } from '../../../e2e-common/e2e-common-utils';
import { initialData } from '../../../e2e-common/e2e-initial-data';
import { testConfig } from '../../../e2e-common/test-config';
import { TestEmailTransporter } from './utils/test-email-transporter.strategy';
import { TestPasswordValidationStrategy } from './utils/test-password-validation.strategy';

let sendEmailFn: Mock;

const successErrorGuard: ApiErrorGuard<{ success: boolean }> = createApiErrorGuard(
    input => input.success != null,
);

const authenticatedUserErrorGuard: ApiErrorGuard<{ id: string; identifier: string }> = createApiErrorGuard(
    input => input.id != null && input.identifier !== null,
);

describe.skip('Developer Authentication', () => {
    const { server, developerClient } = createTestEnvironment(
        mergeConfig(
            {
                auth: {
                    passwordValidationStrategy: new TestPasswordValidationStrategy(),
                    requireVerification: true,
                },
                system: { email: { emailTransporterStrategy: new TestEmailTransporter(sendEmailFn) } },
            },
            testConfig(),
        ),
    );

    beforeAll(async () => {
        await server.init({
            initialData,
            developerCount: 1,
        });
    }, getE2ETestSetupTimeout());

    afterAll(async () => {
        await server.destroy();
    });

    beforeEach(() => {
        sendEmailFn = vi.fn();
    });

    describe('Account Registration Workflow', () => {
        const password = 'password';

        it('fails on providing an invalid password', async () => {
            const input: RegisterDeveloperAccountDtoType['input'] = {
                firstName: 'john',
                lastName: 'doe',
                emailAddress: 'account_reg_invalid_password@test.com',
                password: '12345678',
            };
            const res = await developerClient.fetch(`/auth/accounts`, {
                method: 'POST',
                body: JSON.stringify(input),
            });
            const result = (await res.json()) as RegisterDeveloperAccountDtoType['output'];

            successErrorGuard.assertApiError(result);
            expect(result.code).toBe('PASSWORD_VALIDATION_ERROR');
            expect((result as PasswordValidationError).validationErrorMessage).toBe("Don't use 12345678!");
        });

        it('fails on providing a conflicting email address', async () => {
            const emailAddress = 'account_reg_conflict@test.com';
            const developer1Input: RegisterDeveloperAccountDtoType['input'] = {
                firstName: 'john',
                lastName: 'doe',
                emailAddress,
                password,
            };
            const developer2Input: RegisterDeveloperAccountDtoType['input'] = {
                firstName: 'john2',
                lastName: 'doe',
                emailAddress,
                password,
            };
            const developer1Res = await developerClient.fetch(`/auth/accounts`, {
                method: 'POST',
                body: JSON.stringify(developer1Input),
            });
            const developer1Result =
                (await developer1Res.json()) as RegisterDeveloperAccountDtoType['output'];

            const developer2Res = await developerClient.fetch(`/auth/accounts`, {
                method: 'POST',
                body: JSON.stringify(developer2Input),
            });
            const developer2Result =
                (await developer2Res.json()) as RegisterDeveloperAccountDtoType['output'];

            successErrorGuard.assertSuccess(developer1Result);
            successErrorGuard.assertApiError(developer2Result);
            expect(developer2Result.code).toBe('EMAIL_ADDRESS_CONFLICT_ERROR');
        });

        it('succeeds on providing valid credentials', async () => {
            await registerAccountAndAssertVerificationToken(
                { emailAddress: 'account_reg_success@test.com', password },
                developerClient,
            );
        });
    });

    describe('Authentication Workflow', () => {
        const emailAddress = 'auth_req@test.com';
        const password = 'password';
        let verificationToken = '';

        beforeAll(() => {
            sendEmailFn = vi.fn();
        });

        beforeAll(async () => {
            await developerClient.asAnonymousUser();
            verificationToken = (
                await registerAccountAndAssertVerificationToken({ emailAddress, password }, developerClient)
            ).verificationToken;
        });

        it('fails if account has not yet verified', async () => {
            const loginResult = await developerClient.asUserWithCredentials(emailAddress, password);

            authenticatedUserErrorGuard.assertApiError(loginResult);
            expect(loginResult.code).toBe('NOT_VERIFIED_ACCOUNT_ERROR');
        });

        it('succeeds if account is verified and credentials are correct', async () => {
            const accountVerificationRes = await developerClient.fetch(`/auth/account-verifications`, {
                method: 'post',
                body: JSON.stringify({ token: verificationToken } satisfies VerifyAccountDtoType['input']),
            });
            const accountVerificationResult =
                (await accountVerificationRes.json()) as VerifyAccountDtoType['output'];

            authenticatedUserErrorGuard.assertSuccess(accountVerificationResult);
            expect(accountVerificationResult.identifier).toBe(emailAddress);

            const loginResult = await developerClient.asUserWithCredentials(emailAddress, password);

            authenticatedUserErrorGuard.assertSuccess(loginResult);

            expect(loginResult.identifier).toBe(emailAddress);
        });
    });

    describe('Account Verification Workflow', () => {
        const emailAddress = 'account_v_req@test.com';
        const password = 'password';
        let verificationToken = '';

        beforeEach(() => {
            sendEmailFn = vi.fn();
        });

        beforeAll(() => {
            sendEmailFn = vi.fn();
        });

        beforeAll(async () => {
            await developerClient.asAnonymousUser();
            verificationToken = (
                await registerAccountAndAssertVerificationToken({ emailAddress, password }, developerClient)
            ).verificationToken;
        });

        it('fails on providing an invalid token', async () => {
            const res = await developerClient.fetch(`/auth/account-verifications`, {
                method: 'post',
                body: JSON.stringify({ token: 'invalid_token' } satisfies VerifyAccountDtoType['input']),
            });
            const result = (await res.json()) as VerifyAccountDtoType['output'];
            authenticatedUserErrorGuard.assertApiError(result);
            expect(result.code).toBe('VERIFICATION_TOKEN_INVALID_ERROR');
        });

        it('succeeds on providing a valid token', async () => {
            const res = await developerClient.fetch(`/auth/account-verifications`, {
                method: 'post',
                body: JSON.stringify({ token: verificationToken } satisfies VerifyAccountDtoType['input']),
            });
            const result = (await res.json()) as VerifyAccountDtoType['output'];
            authenticatedUserErrorGuard.assertSuccess(result);
            expect(result.identifier).toBe(emailAddress);
        });
    });

    describe('Password Reset Workflow', () => {
        const emailAddress = 'passwd_reset_req@test.com';
        const password = 'password';
        let passwordResetToken = '';

        beforeEach(() => {
            sendEmailFn = vi.fn();
        });

        beforeAll(() => {
            sendEmailFn = vi.fn();
        });

        beforeAll(async () => {
            await developerClient.asAnonymousUser();
            await registerAccountAndAssertVerificationToken({ emailAddress, password }, developerClient);
        });

        it('fails silently if the email address is not correct', async () => {
            const res = await developerClient.fetch(`/auth/account-password-change`, {
                method: 'post',
                body: JSON.stringify({
                    emailAddress: 'invalid_e_addr@test.com',
                } satisfies RequestPasswordResetDtoType['input']),
            });
            const result = (await res.json()) as RequestPasswordResetDtoType['output'];
            successErrorGuard.assertSuccess(result);

            expect(result.success).toBe(true);

            expect(sendEmailFn).not.toHaveBeenCalled();
            expect(getPasswordResetToken()).not.toBeDefined();
        });

        it('succeeds, issues a new token, and sends it via email client', async () => {
            const res = await developerClient.fetch(`/auth/account-password-change`, {
                method: 'post',
                body: JSON.stringify({
                    emailAddress: emailAddress,
                } satisfies RequestPasswordResetDtoType['input']),
            });
            const result = (await res.json()) as RequestPasswordResetDtoType['output'];
            successErrorGuard.assertSuccess(result);
            expect(result.success).toBe(true);
            expect(sendEmailFn).toHaveBeenCalledTimes(1);
            expect((sendEmailFn.mock.calls[0][0] as SendEmailOptions).event).toBeInstanceOf(
                PasswordResetRequestedEvent,
            );
            expect(getPasswordResetToken()).toBeDefined();
            passwordResetToken = getPasswordResetToken() as string;
        });

        it('fails validation if the provided token is incorrect', async () => {
            const res = await developerClient.fetch(`/auth/account-password-change`, {
                method: 'PATCH',
                body: JSON.stringify({
                    token: 'incorrectToken',
                    newPassword: 'newPassword',
                } satisfies ResetPasswordDtoType['input']),
            });
            const result = (await res.json()) as ResetPasswordDtoType['output'];
            authenticatedUserErrorGuard.assertApiError(result);
            expect(result.code).toBe('PASSWORD_RESET_TOKEN_INVALID_ERROR');
        });

        it('fails validation if the provided password is invalid', async () => {
            const res = await developerClient.fetch(`/auth/account-password-change`, {
                method: 'PATCH',
                body: JSON.stringify({
                    token: passwordResetToken,
                    newPassword: 'n',
                } satisfies ResetPasswordDtoType['input']),
            });
            const result = (await res.json()) as ResetPasswordDtoType['output'];
            authenticatedUserErrorGuard.assertApiError(result);
            expect(result.code).toBe('PASSWORD_VALIDATION_ERROR');
        });

        it('passes validation if the provided password,and token are valid', async () => {
            const res = await developerClient.fetch(`/auth/account-password-change`, {
                method: 'PATCH',
                body: JSON.stringify({
                    token: passwordResetToken,
                    newPassword: 'password_new',
                } satisfies ResetPasswordDtoType['input']),
            });
            const result = (await res.json()) as ResetPasswordDtoType['output'];
            authenticatedUserErrorGuard.assertSuccess(result);
            expect(result.identifier).toBe(emailAddress);
        });
    });

    describe('Email Address Change Workflow', () => {
        const emailAddress = 'email_change_req@test.com';
        const password = 'password';
        const newEmailAddress = 'email_change_req_new@test.com';
        let identifierChangeToken = '';

        beforeAll(() => {
            sendEmailFn = vi.fn();
        });

        beforeEach(() => {
            sendEmailFn = vi.fn();
        });

        beforeAll(async () => {
            const { input, verificationToken } = await registerAccountAndAssertVerificationToken(
                { emailAddress, password },
                developerClient,
            );
            await developerClient.fetch(`/auth/account-verifications`, {
                method: 'POST',
                body: JSON.stringify({ token: verificationToken } satisfies VerifyAccountDtoType['input']),
            });
            await developerClient.asUserWithCredentials(input.emailAddress, input.password);
        });

        it('fails when there is no active session ', async () => {
            await developerClient.asAnonymousUser();
            const res = await developerClient.fetch('/auth/account-email-address-change', {
                method: 'POST',
                body: JSON.stringify({
                    newEmailAddress: newEmailAddress,
                    password: 'password',
                } satisfies RequestEmailAddressChangeDtoType['input']),
            });
            const result = (await res.json()) as RequestEmailAddressChangeDtoType['output'];
            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails on providing invalid password', async () => {
            await developerClient.asUserWithCredentials(emailAddress, password);

            const res = await developerClient.fetch('/auth/account-email-address-change', {
                method: 'POST',
                body: JSON.stringify({
                    newEmailAddress: newEmailAddress,
                    password: 'n',
                } satisfies RequestEmailAddressChangeDtoType['input']),
            });
            const result = (await res.json()) as RequestEmailAddressChangeDtoType['output'];
            successErrorGuard.assertApiError(result);
            expect(result.code).toBe('INVALID_CREDENTIALS_ERROR');
        });

        it('fails on providing conflicting email address', async () => {
            await developerClient.asUserWithCredentials(emailAddress, password);

            const { input: user2Input } = await registerAccountAndAssertVerificationToken(
                { emailAddress: 'email_change_req_ec_failure_2@test.com', password: 'password' },
                developerClient,
            );
            const res = await developerClient.fetch('/auth/account-email-address-change', {
                method: 'POST',
                body: JSON.stringify({
                    newEmailAddress: user2Input.emailAddress,
                    password: password,
                } satisfies RequestEmailAddressChangeDtoType['input']),
            });
            const result = (await res.json()) as RequestEmailAddressChangeDtoType['output'];
            successErrorGuard.assertApiError(result);
            expect(result.code).toBe('EMAIL_ADDRESS_CONFLICT_ERROR');
        });

        it('succeeds, issues a new token, and sends this token to the email', async () => {
            await developerClient.asUserWithCredentials(emailAddress, password);

            const res = await developerClient.fetch('/auth/account-email-address-change', {
                method: 'POST',
                body: JSON.stringify({
                    newEmailAddress: newEmailAddress,
                    password: password,
                } satisfies RequestEmailAddressChangeDtoType['input']),
            });
            const result = (await res.json()) as RequestEmailAddressChangeDtoType['output'];
            successErrorGuard.assertSuccess(result);
            expect(result.success).toBe(true);
            expect(sendEmailFn).toBeCalledTimes(1);
            expect(getEmailAddressChangeToken()).toBeDefined();
            identifierChangeToken = getEmailAddressChangeToken() as string;
        });

        it('must not allow signing in with the new email before verifying it', async () => {
            const result = await developerClient.asUserWithCredentials(newEmailAddress, password);
            authenticatedUserErrorGuard.assertApiError(result);
            expect(result.code).toBe('INVALID_CREDENTIALS_ERROR');
        });

        it('fails validation on providing an invalid token', async () => {
            const res = await developerClient.fetch('/auth/account-email-address-change', {
                method: 'PATCH',
                body: JSON.stringify({
                    token: 'invalid_token',
                } satisfies ChangeEmailAddressDtoType['input']),
            });
            const result = (await res.json()) as ChangeEmailAddressDtoType['output'];
            successErrorGuard.assertApiError(result);
            expect(result.code).toBe('IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR');
        });

        it('passes validation on providing a valid token', async () => {
            const eventBus = server.app.getProvider<EventBus>(EventBus);
            const handler = vi.fn();
            const eventSubscription = eventBus
                .ofType(IdentifierChangedEvent)
                .subscribe(event => handler(event));

            const res = await developerClient.fetch('/auth/account-email-address-change', {
                method: 'PATCH',
                body: JSON.stringify({
                    token: identifierChangeToken,
                } satisfies ChangeEmailAddressDtoType['input']),
            });
            try {
                const result = (await res.json()) as ChangeEmailAddressDtoType['output'];
                successErrorGuard.assertSuccess(result);
                expect(result.success).toBe(true);
                expect(handler).toHaveBeenCalled();
            } finally {
                eventSubscription.unsubscribe();
            }
        });

        it('should allow the new email address to be used for signing in after it has been verified', async () => {
            const result = await developerClient.asUserWithCredentials(newEmailAddress, password);
            authenticatedUserErrorGuard.assertSuccess(result);
            expect(result.identifier).toBe(newEmailAddress);
        });

        it('must prevent using the old email address for signing in after the new one is verified', async () => {
            const result = await developerClient.asUserWithCredentials(emailAddress, password);
            authenticatedUserErrorGuard.assertApiError(result);
            expect(result.code).toBe('INVALID_CREDENTIALS_ERROR');
        });
    });

    describe('Password Update Workflow', () => {
        const currentPassword = 'test';
        const newPassword = 'newPassword';
        const emailAddress = 'passwd_update_req@test.com';

        beforeAll(() => {
            sendEmailFn = vi.fn();
        });

        beforeAll(async () => {
            const { input, verificationToken } = await registerAccountAndAssertVerificationToken(
                { emailAddress, password: currentPassword },
                developerClient,
            );
            await developerClient.fetch(`/auth/account-verifications`, {
                method: 'POST',
                body: JSON.stringify({ token: verificationToken } satisfies VerifyAccountDtoType['input']),
            });
            await developerClient.asUserWithCredentials(input.emailAddress, input.password);
        });

        it('fails if there is not active session', async () => {
            await developerClient.asAnonymousUser();
            const res = await developerClient.fetch('/auth/accounts/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                } satisfies UpdatePasswordDtoType['input']),
            });
            const result = (await res.json()) as UpdatePasswordDtoType['output'];
            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails on providing an invalid new password', async () => {
            const loginResult = await developerClient.asUserWithCredentials(emailAddress, currentPassword);
            authenticatedUserErrorGuard.assertSuccess(loginResult);

            const res = await developerClient.fetch('/auth/accounts/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    currentPassword,
                    newPassword: 'n',
                } satisfies UpdatePasswordDtoType['input']),
            });
            const result = (await res.json()) as UpdatePasswordDtoType['output'];
            successErrorGuard.assertApiError(result);
            expect(result.code).toBe('PASSWORD_VALIDATION_ERROR');
        });

        it('fails on providing incorrect current password', async () => {
            const res = await developerClient.fetch('/auth/accounts/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    currentPassword: 'incorrect_passwd',
                    newPassword: newPassword,
                } satisfies UpdatePasswordDtoType['input']),
            });
            const result = (await res.json()) as UpdatePasswordDtoType['output'];
            successErrorGuard.assertApiError(result);
            expect(result.code).toBe('INVALID_CREDENTIALS_ERROR');
        });

        it('succeeds on providing correct current, and new passwords', async () => {
            const res = await developerClient.fetch('/auth/accounts/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    currentPassword,
                    newPassword: newPassword,
                } satisfies UpdatePasswordDtoType['input']),
            });
            const result = (await res.json()) as UpdatePasswordDtoType['output'];
            successErrorGuard.assertSuccess(result);
            expect(result.success).toBe(true);
        });
    });
});

async function registerAccountAndAssertVerificationToken(
    credentials: { emailAddress: string; password: string } = {
        emailAddress: 'test@test.com',
        password: 'password',
    },
    developerClient: ApiClient,
) {
    const input: RegisterDeveloperAccountDtoType['input'] = {
        firstName: 'john',
        lastName: 'doe',
        ...credentials,
    };
    const res = await developerClient.fetch(`/auth/accounts`, {
        method: 'post',
        body: JSON.stringify(input),
    });
    const result = (await res.json()) as RegisterDeveloperAccountDtoType['output'];
    successErrorGuard.assertSuccess(result);

    expect(result.success).toBe(true);
    await vi.waitFor(() => expect(sendEmailFn).toHaveBeenCalled());
    const verificationToken = getRegistrationVerificationToken();
    expect(verificationToken).toBeDefined();

    return { result, input, verificationToken: verificationToken as string };
}

function getRegistrationVerificationToken(): string | null | undefined {
    const event = sendEmailFn.mock.calls
        .map(
            ([options]) =>
                (
                    options as SendEmailOptions & {
                        event: AccountRegistrationEvent | PasswordResetRequestedEvent;
                    }
                ).event,
        )
        .find(event => event instanceof AccountRegistrationEvent);
    return event?.user.getNativeAuthenticationMethod().verificationToken;
}

function getPasswordResetToken(): string | null | undefined {
    const event = sendEmailFn.mock.calls
        .map(
            ([options]) =>
                (
                    options as SendEmailOptions & {
                        event: AccountRegistrationEvent | PasswordResetRequestedEvent;
                    }
                ).event,
        )
        .find(event => event instanceof PasswordResetRequestedEvent);
    return event?.user.getNativeAuthenticationMethod().passwordResetToken;
}

function getEmailAddressChangeToken(): string | null | undefined {
    const event = sendEmailFn.mock.calls
        .map(
            ([options]) =>
                (
                    options as SendEmailOptions & {
                        event:
                            | AccountRegistrationEvent
                            | PasswordResetRequestedEvent
                            | IdentifierChangeRequestedEvent;
                    }
                ).event,
        )
        .find(event => event instanceof IdentifierChangeRequestedEvent);
    return event?.user.getNativeAuthenticationMethod().identifierChangeToken;
}
