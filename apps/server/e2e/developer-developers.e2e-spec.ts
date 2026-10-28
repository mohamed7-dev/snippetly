import {
    ActiveDeveloperDtoType,
    CollectionListDtoType,
    CurrentUserFriendsListDtoType,
    CurrentUserInboxListDtoType,
    CurrentUserOutboxListDtoType,
    DeleteDeveloperAccountDtoType,
    DeveloperListDtoType,
    FindOneDeveloperDtoType,
    FriendshipStatus,
    SearchDtoType,
    SnippetListDtoType,
    UpdateDeveloperAccountDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { DatabaseService, Developer, Friendship, mergeConfig } from '@snippetly/server';
import { afterAll, beforeAll, describe, expect, it, Mock, vi } from 'vitest';
import { getE2ETestSetupTimeout } from '../../../e2e-common/e2e-common-utils';
import { initialData } from '../../../e2e-common/e2e-initial-data';
import { testConfig } from '../../../e2e-common/test-config';
import { createTestEnvironment } from './support/create-test-environment';
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

        it('returns an empty discovery page without enriching developers', async () => {
            const searchParams = transformInputToSearchParams({
                take: 20,
                skip: 1000,
                discover: true,
            } satisfies DeveloperListDtoType['input']);
            const res = await developerClient.fetch(`/developers?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as DeveloperListDtoType['output'];

            expect(res.status).toBe(200);
            expect(result.items).toEqual([]);
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

            const acceptedFriendRes = await developerClient.fetch(`/developers?${searchParams.toString()}`, {
                method: 'GET',
            });
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
            const friendshipRepository = server.app
                .getProvider<DatabaseService>(DatabaseService)
                .getRepository(Friendship);
            const friendship = await friendshipRepository.findOne({
                where: [
                    { requester: { id: owner.id }, addressee: { id: server.state.developers[0].id } },
                    { requester: { id: server.state.developers[0].id }, addressee: { id: owner.id } },
                ],
            });
            if (!friendship) throw new Error('Expected the seeded friendship to exist');
            friendship.status = FriendshipStatus.Pending;
            friendship.acceptedAt = null;
            await friendshipRepository.save(friendship);

            const res = await developerClient.fetch('/developers/me', { method: 'DELETE' });
            const result = (await res.json()) as DeleteDeveloperAccountDtoType['output'];

            expect(result.result).toBe('DELETED');
        });
    });

    describe('as a different authenticated user', () => {
        beforeAll(async () => {
            await developerClient.asUserWithCredentials(server.state.developers[0].emailAddress, 'test');
        });

        it('excludes a soft-deleted developer from developer discovery and public profile reads', async () => {
            const listResponse = await developerClient.fetch('/developers', { method: 'GET' });
            const listResult = (await listResponse.json()) as DeveloperListDtoType['output'];
            if (!('items' in listResult)) throw new Error('Expected developer discovery to return a list');
            expect(listResult.items.some(item => item.id === server.state.developers[1].id)).toBe(false);

            const profileResponse = await developerClient.fetch(
                `/developers/${server.state.developers[1].id}`,
                {
                    method: 'GET',
                },
            );
            const profileResult = (await profileResponse.json()) as { code?: string };
            expect(profileResult.code).toBe('ENTITY_NOT_FOUND_ERROR');
        });

        it('excludes resources authored by a soft-deleted developer from listings, search, and direct reads', async () => {
            const deletedDeveloperId = server.state.developers[1].id;
            const ownedSnippet = server.state.snippets.find(
                snippet => snippet.creator.id === deletedDeveloperId,
            );
            const ownedCollection = server.state.collections.find(
                collection => collection.creator.id === deletedDeveloperId,
            );
            if (!ownedSnippet || !ownedCollection) {
                throw new Error(
                    'Expected the deleted developer to own seeded snippet and collection resources',
                );
            }

            const snippetParams = transformInputToSearchParams({
                creator: deletedDeveloperId,
            } satisfies SnippetListDtoType['input']);
            const snippetsResponse = await developerClient.fetch(`/snippets?${snippetParams.toString()}`);
            const snippetsResult = (await snippetsResponse.json()) as SnippetListDtoType['output'];
            if (!('items' in snippetsResult)) throw new Error('Expected snippets endpoint to return a list');
            expect(snippetsResult.items).toEqual([]);
            expect(snippetsResult.itemsCount).toBe(0);

            const collectionParams = transformInputToSearchParams({
                creator: deletedDeveloperId,
            } satisfies CollectionListDtoType['input']);
            const collectionsResponse = await developerClient.fetch(
                `/collections?${collectionParams.toString()}`,
            );
            const collectionsResult = (await collectionsResponse.json()) as CollectionListDtoType['output'];
            if (!('items' in collectionsResult))
                throw new Error('Expected collections endpoint to return a list');
            expect(collectionsResult.items).toEqual([]);
            expect(collectionsResult.itemsCount).toBe(0);

            const searchParams = transformInputToSearchParams({
                term: `Snippet for ${server.state.developers[1].emailAddress}`,
                take: 100,
            });
            const searchResponse = await developerClient.fetch(`/search?${searchParams.toString()}`);
            const searchResult = (await searchResponse.json()) as SearchDtoType['output'];
            if (!('snippets' in searchResult)) throw new Error('Expected search endpoint to return results');
            expect(searchResult.snippets.items.some(item => item.creator.id === deletedDeveloperId)).toBe(
                false,
            );

            const collectionSearchParams = transformInputToSearchParams({
                term: `Collection for ${server.state.developers[1].emailAddress}`,
                take: 100,
            });
            const collectionSearchResponse = await developerClient.fetch(
                `/search?${collectionSearchParams.toString()}`,
            );
            const collectionSearchResult = (await collectionSearchResponse.json()) as SearchDtoType['output'];
            if (!('collections' in collectionSearchResult))
                throw new Error('Expected search endpoint to return collections');
            expect(
                collectionSearchResult.collections.items.some(item => item.creator.id === deletedDeveloperId),
            ).toBe(false);

            const snippetResponse = await developerClient.fetch(`/snippets/${ownedSnippet.id}`);
            const snippetResult = (await snippetResponse.json()) as { code?: string };
            expect(snippetResult.code).toBe('ENTITY_NOT_FOUND_ERROR');

            const collectionResponse = await developerClient.fetch(`/collections/${ownedCollection.id}`);
            const collectionResult = (await collectionResponse.json()) as { code?: string };
            expect(collectionResult.code).toBe('ENTITY_NOT_FOUND_ERROR');
        });

        it('excludes soft-deleted developers from current friendship listings and counts', async () => {
            const response = await developerClient.fetch('/friendships/current', { method: 'GET' });
            const result = (await response.json()) as CurrentUserFriendsListDtoType['output'];
            if (!('items' in result)) throw new Error('Expected friendships endpoint to return a list');

            expect(result.items).toEqual([]);
            expect(result.itemsCount).toBe(0);

            const inboxResponse = await developerClient.fetch('/friendships/inbox', { method: 'GET' });
            const inboxResult = (await inboxResponse.json()) as CurrentUserInboxListDtoType['output'];
            if (!('items' in inboxResult)) throw new Error('Expected inbox endpoint to return a list');
            expect(inboxResult.items).toEqual([]);
            expect(inboxResult.itemsCount).toBe(0);

            const outboxResponse = await developerClient.fetch('/friendships/outbox', { method: 'GET' });
            const outboxResult = (await outboxResponse.json()) as CurrentUserOutboxListDtoType['output'];
            if (!('items' in outboxResult)) throw new Error('Expected outbox endpoint to return a list');
            expect(outboxResult.items).toEqual([]);
            expect(outboxResult.itemsCount).toBe(0);

            const profileResponse = await developerClient.fetch(
                `/developers/${server.state.developers[0].id}`,
            );
            const profile = (await profileResponse.json()) as FindOneDeveloperDtoType['output'];
            if (!('activity' in profile)) throw new Error('Expected developer profile activity data');
            expect(profile.activity.stats.friendsCount).toBe(0);
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
