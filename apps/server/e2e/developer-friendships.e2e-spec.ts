import {
    AcceptFriendshipRequestDtoType,
    CancelFriendshipRequestDtoType,
    CreateDeveloperDtoType,
    CurrentUserFriendsListDtoType,
    CurrentUserInboxListDtoType,
    CurrentUserOutboxListDtoType,
    FriendshipStatus,
    RejectFriendshipRequestDtoType,
    SendFriendshipRequestDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { Developer, mergeConfig } from '@snippetly/server';
import { ApiClient, ApiErrorGuard, createApiErrorGuard, createTestEnvironment } from '@snippetly/testing';
import { afterAll, beforeAll, describe, expect, it, Mock, vi } from 'vitest';
import { getE2ETestSetupTimeout } from '../../../e2e-common/e2e-common-utils';
import { initialData } from '../../../e2e-common/e2e-initial-data';
import { testConfig } from '../../../e2e-common/test-config';
import { authenticatedUserErrorGuard } from './utils/error-guards';
import { TestEmailTransporter } from './utils/test-email-transporter.strategy';
import { TestPasswordValidationStrategy } from './utils/test-password-validation.strategy';

export const friendshipErrorGuard: ApiErrorGuard<{
    id: string;
}> = createApiErrorGuard(input => 'id' in input);

export const developerGuard: ApiErrorGuard<{ id: string; emailAddress: string }> = createApiErrorGuard(
    input => input.id != null && input.emailAddress !== null,
);

let sendEmailFn: Mock;

describe('Developer Friendship Workflows', () => {
    const { server, developerClient, adminClient } = createTestEnvironment(
        mergeConfig(
            {
                auth: {
                    passwordValidationStrategy: new TestPasswordValidationStrategy(),
                },
                system: {
                    email: {
                        emailTransporterStrategy: new TestEmailTransporter(sendEmailFn),
                    },
                },
            },
            testConfig(),
        ),
    );

    beforeAll(async () => {
        sendEmailFn = vi.fn();
        await server.init({
            initialData: initialData,
            developerCount: 2,
            logging: true,
        });
    }, getE2ETestSetupTimeout());

    afterAll(async () => {
        await server.destroy();
    });

    describe('performing protected operations as a non-authenticated user', () => {
        let developer: Developer;
        beforeAll(async () => {
            await developerClient.asAnonymousUser();
            developer = server.state.developers[1];
        });

        it('fails when sending friendship request', async () => {
            const res = await developerClient.fetch(`/friendships/${developer.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when accepting friendship request', async () => {
            const res = await developerClient.fetch(`/friendships/${developer.id}/accept`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as AcceptFriendshipRequestDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when rejecting friendship request', async () => {
            const res = await developerClient.fetch(`/friendships/${developer.id}/reject`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as RejectFriendshipRequestDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when cancelling friendship request', async () => {
            const res = await developerClient.fetch(`/friendships/${developer.id}`, {
                method: 'DELETE',
            });

            const result = (await res.json()) as CancelFriendshipRequestDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when listing my friendships', async () => {
            const res = await developerClient.fetch(`/friendships/current`, {
                method: 'GET',
            });

            const result = (await res.json()) as CurrentUserFriendsListDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when listing my inbox', async () => {
            const res = await developerClient.fetch(`/friendships/inbox`, {
                method: 'GET',
            });

            const result = (await res.json()) as CurrentUserInboxListDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when listing my outbox', async () => {
            const res = await developerClient.fetch(`/friendships/outbox`, {
                method: 'GET',
            });

            const result = (await res.json()) as CurrentUserOutboxListDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });
    });

    describe('Sending Workflow', () => {
        let addressee: Developer;
        let authenticatedDeveloper: Developer;
        let requester: Developer;

        beforeAll(async () => {
            addressee = (await createDeveloper(
                {
                    firstName: 'john',
                    lastName: 'doe',
                    emailAddress: 'test_new1@example.com',
                    password: 'test',
                },
                adminClient,
            )) as unknown as Developer;
            requester = server.state.developers[0];
            authenticatedDeveloper = requester;
            const loginResult = await developerClient.asUserWithCredentials(
                authenticatedDeveloper.emailAddress,
                'test',
            );
            authenticatedUserErrorGuard.assertSuccess(loginResult);
        });

        it('fails when sending a request with self reference', async () => {
            const res = await developerClient.fetch(`/friendships/${requester.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
        });

        it('succeeds when sending a request as an requester', async () => {
            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);
            expect(result.status).toBe(FriendshipStatus.Pending);
            expect(result.createdAt).not.toBe(null);
            expect(result.requester.id).toBe(requester.id);
            expect(result.addressee.id).toBe(addressee.id);
        });
    });

    describe('Acceptance Workflow', () => {
        let addressee: Developer;
        let authenticatedDeveloper: Developer;
        let requester: Developer;
        beforeAll(async () => {
            addressee = (await createDeveloper(
                {
                    firstName: 'john',
                    lastName: 'doe',
                    emailAddress: 'test_new2@example.com',
                    password: 'test',
                },
                adminClient,
            )) as unknown as Developer;
            requester = server.state.developers[0];
            const loginResult = await developerClient.asUserWithCredentials(requester.emailAddress, 'test');
            authenticatedUserErrorGuard.assertSuccess(loginResult);

            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);

            authenticatedDeveloper = addressee;
            const loginCreatedDevResult = await developerClient.asUserWithCredentials(
                authenticatedDeveloper.emailAddress,
                'test',
            );
            authenticatedUserErrorGuard.assertSuccess(loginCreatedDevResult);
        });

        it('fails when accepting a request with self reference', async () => {
            const res = await developerClient.fetch(`/friendships/${addressee.id}/accept`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as AcceptFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
        });

        it('fails when accepting a request that does not exist', async () => {
            const res = await developerClient.fetch(`/friendships/${server.state.developers[1].id}/accept`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as AcceptFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
        });

        it('succeeds when accepting a request as an addressee', async () => {
            const res = await developerClient.fetch(`/friendships/${requester.id}/accept`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as AcceptFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);
            expect(result.status).toBe(FriendshipStatus.Accepted);
            expect(result.acceptedAt).not.toBe(null);
            expect(result.requester.id).toBe(requester.id);
            expect(result.addressee.id).toBe(addressee.id);
        });
    });

    describe('Rejection Workflow', () => {
        let addressee: Developer;
        let authenticatedDeveloper: Developer;
        let requester: Developer;
        beforeAll(async () => {
            addressee = (await createDeveloper(
                {
                    firstName: 'john',
                    lastName: 'doe',
                    emailAddress: 'test_new3@example.com',
                    password: 'test',
                },
                adminClient,
            )) as unknown as Developer;
            requester = server.state.developers[0];
            const loginResult = await developerClient.asUserWithCredentials(requester.emailAddress, 'test');
            authenticatedUserErrorGuard.assertSuccess(loginResult);

            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);

            authenticatedDeveloper = addressee;
            const loginCreatedDevResult = await developerClient.asUserWithCredentials(
                authenticatedDeveloper.emailAddress,
                'test',
            );
            authenticatedUserErrorGuard.assertSuccess(loginCreatedDevResult);
        });

        it('fails when rejecting a request with self reference', async () => {
            const res = await developerClient.fetch(`/friendships/${addressee.id}/reject`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as RejectFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
        });

        it('fails when rejecting a request that does not exist', async () => {
            const res = await developerClient.fetch(`/friendships/${server.state.developers[1].id}/reject`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as RejectFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
        });

        it('succeeds when rejecting a request as an addressee', async () => {
            const res = await developerClient.fetch(`/friendships/${requester.id}/reject`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as RejectFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);
            expect(result.status).toBe(FriendshipStatus.Rejected);
            expect(result.rejectedAt).not.toBe(null);
            expect(result.requester.id).toBe(requester.id);
            expect(result.addressee.id).toBe(addressee.id);
        });
    });

    describe('Cancelling Workflow', () => {
        let addressee: Developer;
        let requester: Developer;

        beforeAll(async () => {
            addressee = (await createDeveloper(
                {
                    firstName: 'john',
                    lastName: 'doe',
                    emailAddress: 'test_new4@example.com',
                    password: 'test',
                },
                adminClient,
            )) as unknown as Developer;
            requester = server.state.developers[0];
            const loginResult = await developerClient.asUserWithCredentials(requester.emailAddress, 'test');
            authenticatedUserErrorGuard.assertSuccess(loginResult);

            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);
        });

        it('fails when cancelling a request with self reference', async () => {
            const res = await developerClient.fetch(`/friendships/${requester.id}`, {
                method: 'DELETE',
            });

            const result = (await res.json()) as CancelFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
        });

        it('succeeds when cancelling a request as a requester', async () => {
            const res = await developerClient.fetch(`/friendships/${addressee.id}`, {
                method: 'DELETE',
            });

            const result = (await res.json()) as CancelFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);
            expect(result.status).toBe(FriendshipStatus.Cancelled);
            expect(result.cancelledAt).not.toBe(null);
            expect(result.requester.id).toBe(requester.id);
            expect(result.addressee.id).toBe(addressee.id);
        });
    });

    describe('With An Already Sent Request', () => {
        let addressee: Developer;
        let requester: Developer;

        beforeAll(async () => {
            addressee = (await createDeveloper(
                {
                    firstName: 'john',
                    lastName: 'doe',
                    emailAddress: 'test_new6@example.com',
                    password: 'test',
                },
                adminClient,
            )) as unknown as Developer;
            requester = server.state.developers[0];

            const loginResult = await developerClient.asUserWithCredentials(requester.emailAddress, 'test');
            authenticatedUserErrorGuard.assertSuccess(loginResult);

            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);
        });

        it('another request should fail', async () => {
            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
            expect((result as any).reason).toMatch(/A pending friendship request already exists/gi);
        });

        it('acceptance request sent by the requester should fail', async () => {
            const res = await developerClient.fetch(`/friendships/${addressee.id}/accept`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as AcceptFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
            expect((result as any).reason).toMatch(
                /Only the addressee of a friendship request can accept it/gi,
            );
        });

        it('rejection request sent by the requester should fail', async () => {
            const res = await developerClient.fetch(`/friendships/${addressee.id}/reject`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as RejectFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
            expect((result as any).reason).toMatch(
                /Only the addressee of a friendship request can reject it/gi,
            );
        });
    });

    describe('With An Already Accepted Request', () => {
        let addressee: Developer;
        let requester: Developer;

        beforeAll(async () => {
            addressee = (await createDeveloper(
                {
                    firstName: 'john',
                    lastName: 'doe',
                    emailAddress: 'test_new7@example.com',
                    password: 'test',
                },
                adminClient,
            )) as unknown as Developer;
            requester = server.state.developers[0];

            // login as requester
            const loginResult = await developerClient.asUserWithCredentials(requester.emailAddress, 'test');
            authenticatedUserErrorGuard.assertSuccess(loginResult);

            // send request
            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);

            // login as addressee
            const addresseeLoginResult = await developerClient.asUserWithCredentials(
                addressee.emailAddress,
                'test',
            );
            authenticatedUserErrorGuard.assertSuccess(addresseeLoginResult);

            // accept request
            const acceptRes = await developerClient.fetch(`/friendships/${requester.id}/accept`, {
                method: 'PATCH',
            });

            const acceptResult = (await acceptRes.json()) as AcceptFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(acceptResult);
        });

        it('another request should fail', async () => {
            const res = await developerClient.fetch(`/friendships/${requester.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
            expect((result as any).reason).toMatch(/This friendship has already been accepted/gi);
        });

        it('another acceptance request should fail', async () => {
            const res = await developerClient.fetch(`/friendships/${requester.id}/accept`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as AcceptFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
            expect((result as any).reason).toMatch(/Only a pending friendship request can be accepted/gi);
        });

        it('rejection request should fail', async () => {
            const res = await developerClient.fetch(`/friendships/${requester.id}/reject`, {
                method: 'PATCH',
            });

            const result = (await res.json()) as RejectFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
            expect((result as any).reason).toMatch(/Only a pending friendship request can be rejected/gi);
        });

        it('cancel request should fail', async () => {
            const res = await developerClient.fetch(`/friendships/${requester.id}`, {
                method: 'DELETE',
            });

            const result = (await res.json()) as CancelFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertApiError(result);
            expect((result as any).code).toBe('INVALID_FRIENDSHIP_ACTION_ERROR');
            expect((result as any).reason).toMatch(
                /Only the requester can cancel a pending friendship request/gi,
            );
        });
    });

    describe('Listing Inbox Friendships', () => {
        let addressee: Developer;
        let requester: Developer;

        beforeAll(async () => {
            addressee = (await createDeveloper(
                {
                    firstName: 'john',
                    lastName: 'doe',
                    emailAddress: 'test_new8@example.com',
                    password: 'test',
                },
                adminClient,
            )) as unknown as Developer;
            requester = server.state.developers[0];

            // login as requester
            const loginResult = await developerClient.asUserWithCredentials(requester.emailAddress, 'test');
            authenticatedUserErrorGuard.assertSuccess(loginResult);

            // send request
            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);

            // login as addressee
            const addresseeLoginResult = await developerClient.asUserWithCredentials(
                addressee.emailAddress,
                'test',
            );
            authenticatedUserErrorGuard.assertSuccess(addresseeLoginResult);
        });

        it('lists pending friendships sent to the addressee', async () => {
            const res = await developerClient.fetch('/friendships/inbox', {
                method: 'GET',
            });
            const result = (await res.json()) as CurrentUserInboxListDtoType['output'];

            expect(result.items.length).toBe(1);
            expect(result.items[0].requester.id).toBe(requester.id);
            expect(result.items[0].addressee.id).toBe(addressee.id);
            expect(result.items[0].status).toBe(FriendshipStatus.Pending);
        });
    });

    describe('Listing Outbox Friendships', () => {
        let addressee: Developer;
        let requester: Developer;

        beforeAll(async () => {
            requester = (await createDeveloper(
                {
                    firstName: 'john',
                    lastName: 'doe',
                    emailAddress: 'test_new9@example.com',
                    password: 'test',
                },
                adminClient,
            )) as unknown as Developer;
            addressee = server.state.developers[1];

            // login as requester
            const loginResult = await developerClient.asUserWithCredentials(requester.emailAddress, 'test');
            authenticatedUserErrorGuard.assertSuccess(loginResult);

            // send request
            const res = await developerClient.fetch(`/friendships/${addressee.id}/requests`, {
                method: 'POST',
            });

            const result = (await res.json()) as SendFriendshipRequestDtoType['output'];
            friendshipErrorGuard.assertSuccess(result);
        });

        it('lists pending friendships sent by the requester', async () => {
            const res = await developerClient.fetch('/friendships/outbox', {
                method: 'GET',
            });
            const result = (await res.json()) as CurrentUserOutboxListDtoType['output'];

            expect(result.items.length).toBe(1);
            expect(result.items[0].requester.id).toBe(requester.id);
            expect(result.items[0].addressee.id).toBe(addressee.id);
            expect(result.items.map(f => f.status)).toContainEqual(FriendshipStatus.Pending);
        });
    });

    describe('Listing Current User Friendships', () => {
        let authenticatedDeveloper: Developer;

        beforeAll(async () => {
            authenticatedDeveloper = server.state.developers[0];

            const loginResult = await developerClient.asUserWithCredentials(
                authenticatedDeveloper.emailAddress,
                'test',
            );
            authenticatedUserErrorGuard.assertSuccess(loginResult);
        });

        it('lists accepted friendships, and respects take filter options', async () => {
            const res = await developerClient.fetch(
                `/friendships/current?${transformInputToSearchParams({ take: 1 } satisfies CurrentUserFriendsListDtoType['input']).toString()}`,
                {
                    method: 'GET',
                },
            );
            const result = (await res.json()) as CurrentUserFriendsListDtoType['output'];

            expect(result.items.length).toBe(1);
            expect(result.items.map(f => f.status)).toContainEqual(FriendshipStatus.Accepted);
        });
    });
});

async function createDeveloper(input: CreateDeveloperDtoType['input'], adminClient: ApiClient) {
    return await adminClient.asSuperAdmin().then(async () => {
        const res = await adminClient.fetch('/developers', {
            method: 'POST',
            body: JSON.stringify({
                ...input,
            } satisfies CreateDeveloperDtoType['input']),
        });
        const result = (await res.json()) as CreateDeveloperDtoType['output'];
        developerGuard.assertSuccess(result);
        return result;
    });
}
