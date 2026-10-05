import {
    ActiveDeveloperDtoType,
    DeleteDeveloperAccountDtoType,
    DeveloperListDtoType,
    FriendshipStatus,
    FindOneDeveloperDtoType,
    UpdateDeveloperAccountDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { DatabaseService, Developer, Friendship, mergeConfig } from '@snippetly/server';
import { createTestEnvironment } from '@snippetly/testing';
import { afterAll, beforeAll, describe, expect, it, Mock, vi } from 'vitest';
import { getE2ETestSetupTimeout } from '../../../e2e-common/e2e-common-utils';
import { initialData } from '../../../e2e-common/e2e-initial-data';
import { testConfig } from '../../../e2e-common/test-config';
import { TestEmailTransporter } from './utils/test-email-transporter.strategy';
import { TestPasswordValidationStrategy } from './utils/test-password-validation.strategy';

let sendEmailFn: Mock;

describe('Developer Account Workflows', () => {
    const { server, developerClient } = createTestEnvironment(
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
            initialData,
            developerCount: 2,
            logging: true,
        });
    }, getE2ETestSetupTimeout());

    afterAll(async () => {
        await server.destroy();
    });

    describe('as a non-authenticated user', () => {
        beforeAll(async () => {
            await developerClient.asAnonymousUser();
        });

        it('returns null for the current developer account', async () => {
            const res = await developerClient.fetch('/developers/me', { method: 'GET' });
            const result = (await res.json()) as ActiveDeveloperDtoType['output'];

            expect(result).toBeNull();
        });

        it('denies updating the current developer account', async () => {
            const res = await developerClient.fetch('/developers/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    firstName: 'updated',
                } satisfies UpdateDeveloperAccountDtoType['input']),
            });
            const result = await res.json();

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('denies deleting the current developer account', async () => {
            const res = await developerClient.fetch('/developers/me', { method: 'DELETE' });
            const result = await res.json();

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('lists public developer fields only', async () => {
            const res = await developerClient.fetch('/developers', { method: 'GET' });
            const result = (await res.json()) as DeveloperListDtoType['output'];

            expect(result.items.length).toBeGreaterThan(0);
            expect(result.itemsCount).toBeGreaterThan(0);
            expect(result.items[0]).not.toHaveProperty('emailAddress');
            expect(result.items[0]).not.toHaveProperty('isPrivate');
            expect(result.items[0]).not.toHaveProperty('user');
        });

        it('includes public content counts and added tags when discovering developers', async () => {
            const searchParams = transformInputToSearchParams({
                take: 100,
                discover: true,
            } satisfies DeveloperListDtoType['input']);
            const res = await developerClient.fetch(`/developers?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as DeveloperListDtoType['output'];

            expect(result.items.length).toBeGreaterThan(0);
            for (const item of result.items) {
                expect(item.snippetsCount).toEqual(expect.any(Number));
                expect(item.collectionsCount).toEqual(expect.any(Number));
                expect(item.tags).toEqual(expect.any(Array));
                for (const addedTag of item.tags ?? []) {
                    expect(addedTag).toEqual({
                        id: expect.any(String),
                        value: expect.any(String),
                        usageCount: expect.any(Number),
                    });
                }
            }
        });

        it('returns only public fields when reading a developer profile', async () => {
            const targetDeveloper = server.state.developers[0];
            const res = await developerClient.fetch(`/developers/${targetDeveloper.id}`, { method: 'GET' });
            const result = (await res.json()) as FindOneDeveloperDtoType['output'];

            expect(result.id).toBe(targetDeveloper.id);
            expect(result).not.toHaveProperty('emailAddress');
            expect(result).not.toHaveProperty('isPrivate');
            expect(result).not.toHaveProperty('user');
            expect(result).not.toHaveProperty('updatedAt');
            expect((result as any).friendCount).toEqual(expect.any(Number));
            expect((result as any).friendshipInfo).toEqual({
                isCurrentUserAFriend: false,
                requestStatus: null,
            });
            expect((result as any).stats).toEqual({
                snippetsCount: expect.any(Number),
                collectionsCount: expect.any(Number),
                friendsCount: expect.any(Number),
                forkedSnippetsCount: expect.any(Number),
                forkedCollectionsCount: expect.any(Number),
                friendsInboxCount: expect.any(Number),
                friendsOutboxCount: expect.any(Number),
            });
        });
    });

    describe('as the account owner', () => {
        let owner: Developer;

        beforeAll(async () => {
            owner = server.state.developers[1];
            await developerClient.asUserWithCredentials(owner.emailAddress, 'test');
        });

        it('reads the current developer account with owner fields', async () => {
            const res = await developerClient.fetch('/developers/me', { method: 'GET' });
            const result = (await res.json()) as ActiveDeveloperDtoType['output'];
            expect(result?.id).toBe(owner.id);
            expect(result).toHaveProperty('emailAddress', owner.emailAddress);
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('isPrivate');
            const stats = result && 'stats' in result ? result.stats : undefined;
            expect(stats).toEqual({
                snippetsCount: expect.any(Number),
                collectionsCount: expect.any(Number),
                friendsCount: expect.any(Number),
                forkedSnippetsCount: expect.any(Number),
                forkedCollectionsCount: expect.any(Number),
                friendsInboxCount: expect.any(Number),
                friendsOutboxCount: expect.any(Number),
            });
        });

        it('updates the current developer account', async () => {
            const res = await developerClient.fetch('/developers/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    bio: 'Developer account e2e test',
                    isPrivate: true,
                } satisfies UpdateDeveloperAccountDtoType['input']),
            });
            const result = (await res.json()) as UpdateDeveloperAccountDtoType['output'];

            expect(result.id).toBe(owner.id);
            expect(result.bio).toBe('Developer account e2e test');
            expect(result.isPrivate).toBe(true);
        });

        it('excludes only accepted friends from public discovery', async () => {
            const friend = server.state.developers[0];
            const friendshipRepository = server.app
                .getProvider<DatabaseService>(DatabaseService)
                .getRepository(Friendship);
            const friendship = await friendshipRepository.findOne({
                where: [
                    { requester: { id: owner.id }, addressee: { id: friend.id } },
                    { requester: { id: friend.id }, addressee: { id: owner.id } },
                ],
            });
            if (!friendship) throw new Error('Expected test friendship to exist');
            friendship.requester = owner;
            friendship.addressee = friend;
            friendship.status = FriendshipStatus.Cancelled;
            await friendshipRepository.save(friendship);

            const searchParams = transformInputToSearchParams({
                discover: true,
                take: 100,
            } satisfies DeveloperListDtoType['input']);
            const res = await developerClient.fetch(`/developers?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as DeveloperListDtoType['output'];

            expect(result.items.some(item => item.id === owner.id)).toBe(false);
            expect(result.items.some(item => item.id === friend.id)).toBe(true);
            expect(result.items.every(item => !('emailAddress' in item))).toBe(true);

            friendship.status = FriendshipStatus.Accepted;
            await friendshipRepository.save(friendship);

            const acceptedFriendRes = await developerClient.fetch(
                `/developers?${searchParams.toString()}`,
                { method: 'GET' },
            );
            const acceptedFriendResult = (await acceptedFriendRes.json()) as DeveloperListDtoType['output'];

            expect(acceptedFriendResult.items.some(item => item.id === owner.id)).toBe(false);
            expect(acceptedFriendResult.items.some(item => item.id === friend.id)).toBe(false);
        });

        it('reads the private profile with owner fields', async () => {
            const res = await developerClient.fetch(`/developers/${owner.id}`, { method: 'GET' });
            const result = (await res.json()) as FindOneDeveloperDtoType['output'];

            expect(result.id).toBe(owner.id);
            expect(result).toHaveProperty('emailAddress', owner.emailAddress);
            expect(result).toHaveProperty('isPrivate', true);
            expect(result).toHaveProperty('user');
            expect((result as any).friendCount).toEqual(expect.any(Number));
            expect((result as any).friendshipInfo).toEqual({
                isCurrentUserAFriend: false,
                requestStatus: null,
            });
            expect((result as any).stats).toEqual({
                snippetsCount: expect.any(Number),
                collectionsCount: expect.any(Number),
                friendsCount: expect.any(Number),
                forkedSnippetsCount: expect.any(Number),
                forkedCollectionsCount: expect.any(Number),
                friendsInboxCount: expect.any(Number),
                friendsOutboxCount: expect.any(Number),
            });
        });

        it('deletes the current developer account', async () => {
            const res = await developerClient.fetch('/developers/me', { method: 'DELETE' });
            const result = (await res.json()) as DeleteDeveloperAccountDtoType['output'];

            expect(result.result).toBe('DELETED');
        });
    });

    describe('as a different authenticated user', () => {
        beforeAll(async () => {
            await developerClient.asUserWithCredentials(server.state.developers[0].emailAddress, 'test');
        });

        it('can read their own current developer account', async () => {
            const res = await developerClient.fetch('/developers/me', { method: 'GET' });
            const result = (await res.json()) as ActiveDeveloperDtoType['output'];

            expect(result?.id).toBe(server.state.developers[0].id);
        });

        it('cannot read another developer private profile', async () => {
            const res = await developerClient.fetch(`/developers/${server.state.developers[1].id}`, {
                method: 'GET',
            });
            const result = await res.json();

            expect((result as any).code).toBe('ENTITY_NOT_FOUND_ERROR');
        });
    });
});
