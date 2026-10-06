import {
    CreateSnippetDtoType,
    CurrentUserSnippetListDtoType,
    DeleteSnippetDtoType,
    FindOneSnippetDtoType,
    ForkSnippetDtoType,
    FriendshipStatus,
    SnippetListDtoType,
    UpdateSnippetDtoType,
    UserFriendsSnippetsListDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { Developer, mergeConfig, Snippet } from '@snippetly/server';
import { createTestEnvironment } from '@snippetly/testing';
import { afterAll, beforeAll, describe, expect, it, Mock, vi } from 'vitest';
import { getE2ETestSetupTimeout } from '../../../e2e-common/e2e-common-utils';
import { initialData } from '../../../e2e-common/e2e-initial-data';
import { testConfig } from '../../../e2e-common/test-config';
import { TestEmailTransporter } from './utils/test-email-transporter.strategy';
import { TestPasswordValidationStrategy } from './utils/test-password-validation.strategy';

/* Rule
- developer at index 0 should have his snippets static, they shouldn't be mutated after server initialization
this is useful in cases where deterministic testing results are targeted.
- developer at index 1 could be used to perform CRUD operations on snippets as needed.
*/

let sendEmailFn: Mock;

describe('Developer Snippet Workflows', () => {
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
            initialData: initialData,
            developerCount: 2,
            logging: true,
        });
    }, getE2ETestSetupTimeout());

    afterAll(async () => {
        await server.destroy();
    });

    describe('performing protected operations as a non-authenticated user', () => {
        beforeAll(async () => {
            await developerClient.asAnonymousUser();
        });

        it('fails when listing my snippets', async () => {
            const res = await developerClient.fetch('/snippets/me', {
                method: 'GET',
            });

            const result = await res.json();

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it("fails when listing my friends' snippets", async () => {
            const res = await developerClient.fetch('/snippets/friends', {
                method: 'GET',
            });

            const result = await res.json();

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when creating a new snippet', async () => {
            const res = await developerClient.fetch('/snippets', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'test c',
                    slug: 'test-c',
                    language: 'test-lang',
                    code: '<code>test</code>',
                } satisfies CreateSnippetDtoType['input']),
            });

            const result = (await res.json()) as CreateSnippetDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when updating an existing snippet', async () => {
            const res = await developerClient.fetch(`/snippets/${server.state.snippets[0].id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    name: 'updated snippets',
                } satisfies Omit<UpdateSnippetDtoType['input'], 'id'>),
            });

            const result = (await res.json()) as UpdateSnippetDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when forking an existing snippet', async () => {
            const res = await developerClient.fetch(`/snippets/${server.state.snippets[0].id}/forks`, {
                method: 'POST',
            });

            const result = (await res.json()) as ForkSnippetDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when deleting an existing snippet', async () => {
            const res = await developerClient.fetch(`/snippets/${server.state.snippets[0].id}`, {
                method: 'DELETE',
            });

            const result = (await res.json()) as DeleteSnippetDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });
    });

    describe('performing protected operations as an authenticated user', () => {
        let authenticatedDeveloper: Developer;
        const password = 'test';

        beforeAll(async () => {
            authenticatedDeveloper = server.state.developers[1];
            await developerClient.asUserWithCredentials(authenticatedDeveloper.emailAddress, password);
        });

        it('succeeds when listing my snippets', async () => {
            const res = await developerClient.fetch('/snippets/me', {
                method: 'GET',
            });

            const result = (await res.json()) as CurrentUserSnippetListDtoType['output'];

            expect(result.items.length).toBeGreaterThan(0);
            expect(result.itemsCount).toBeGreaterThan(0);
        });

        it('excludes my snippets from discovery but keeps them in regular listings', async () => {
            const discoverParams = transformInputToSearchParams({
                discover: true,
                take: 100,
            } satisfies SnippetListDtoType['input']);
            const discoverRes = await developerClient.fetch(`/snippets?${discoverParams.toString()}`, {
                method: 'GET',
            });
            const discoverResult = (await discoverRes.json()) as SnippetListDtoType['output'];

            expect(discoverResult.items.length).toBeGreaterThan(0);
            expect(discoverResult.items.every(item => item.creator.id !== authenticatedDeveloper.id)).toBe(
                true,
            );

            const regularRes = await developerClient.fetch('/snippets?take=100', {
                method: 'GET',
            });
            const regularResult = (await regularRes.json()) as SnippetListDtoType['output'];

            expect(regularResult.items.some(item => item.creator.id === authenticatedDeveloper.id)).toBe(
                true,
            );
        });

        it("succeeds when listing my friends' snippets", async () => {
            const res = await developerClient.fetch('/snippets/friends', {
                method: 'GET',
            });

            const result = (await res.json()) as UserFriendsSnippetsListDtoType['output'];

            expect(result.items).toBeDefined();
            expect(result.itemsCount).toBeDefined();
        });

        describe('fulfill CRUD requirements', () => {
            let snippet: Snippet;

            beforeAll(() => {
                snippet = server.state.snippets.filter(c => c.creator.id === authenticatedDeveloper.id)?.[0];
            });

            it('succeeds when updating an existing snippet', async () => {
                const res = await developerClient.fetch(`/snippets/${snippet.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        name: 'updated test s',
                    } satisfies Omit<UpdateSnippetDtoType['input'], 'id'>),
                });

                const result = (await res.json()) as UpdateSnippetDtoType['output'];

                expect(result.name).toBe('updated test s');
            });

            it('succeeds when reading an existing snippet', async () => {
                const res = await developerClient.fetch(`/snippets/${snippet.id}`, {
                    method: 'GET',
                });

                const result = (await res.json()) as FindOneSnippetDtoType['output'];

                expect(result.id).toBe(snippet.id);
                assertPrivateFieldsExist(result);
            });

            it('succeeds when forking an existing snippet', async () => {
                const res = await developerClient.fetch(`/snippets/${snippet.id}/forks`, {
                    method: 'POST',
                });

                const result = (await res.json()) as ForkSnippetDtoType['output'];

                expect(result.id).not.toBe(snippet.id);
            });

            it('succeeds when forking a snippet with tags', async () => {
                const sourceRes = await developerClient.fetch('/snippets', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: 'tagged fork source',
                        slug: 'tagged-fork-source',
                        language: 'js',
                        code: 'const tagged = true;',
                        tags: ['fork-regression'],
                    } satisfies CreateSnippetDtoType['input']),
                });
                const source = (await sourceRes.json()) as CreateSnippetDtoType['output'];

                expect(sourceRes.ok).toBe(true);
                if (!('id' in source)) throw new Error('Failed to create tagged snippet for fork test');

                const forkRes = await developerClient.fetch(`/snippets/${source.id}/forks`, {
                    method: 'POST',
                });
                const fork = (await forkRes.json()) as ForkSnippetDtoType['output'];

                expect(forkRes.ok).toBe(true);
                expect('id' in fork && fork.id).not.toBe(source.id);
            });

            it('succeeds when creating&deleting a new snippet', async () => {
                const res = await developerClient.fetch('/snippets', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: 'test snippet',
                        slug: 'test-snippet',
                        language: 'test lang',
                        code: '<code>test</code>',
                    } satisfies CreateSnippetDtoType['input']),
                });

                const result = (await res.json()) as CreateSnippetDtoType['output'];

                expect(result.name).toBe('test snippet');

                const deletionRes = await developerClient.fetch(`/snippets/${result.id}`, {
                    method: 'DELETE',
                });
                const deletionResult = (await deletionRes.json()) as DeleteSnippetDtoType['output'];

                expect(deletionResult.result).toBe('DELETED');
            });
        });
    });

    describe('performing protected operations as an authenticated user, but not the owner', () => {
        let authenticatedDeveloper: Developer;
        let targetSnippet: Snippet;
        const password = 'test';

        beforeAll(async () => {
            authenticatedDeveloper = server.state.developers[0];
            await developerClient.asUserWithCredentials(authenticatedDeveloper.emailAddress, password);
            targetSnippet = server.state.snippets.filter(
                c => c.creator.id !== authenticatedDeveloper.id,
            )?.[0];
        });

        it('returns only public fields when finding the snippet by id', async () => {
            const res = await developerClient.fetch(`/snippets/${targetSnippet.id}`, {
                method: 'GET',
            });
            const result = (await res.json()) as FindOneSnippetDtoType['output'];
            expect(result.id).toBe(targetSnippet.id);
            assertPrivateFieldsAbsent(result);
        });

        it('fails when updating the snippet', async () => {
            const res = await developerClient.fetch(`/snippets/${targetSnippet.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: 'update s name' }),
            });
            const result = await res.json();
            expect((result as any).code).toBe('ENTITY_NOT_FOUND_ERROR');
        });

        it('fails when deleting the snippet', async () => {
            const res = await developerClient.fetch(`/snippets/${targetSnippet.id}`, {
                method: 'DELETE',
            });
            const result = (await res.json()) as DeleteSnippetDtoType['output'];
            expect(result.result).toBe('NOT_DELETED');
        });
    });

    describe('listing snippets as a non-authenticated user', () => {
        let creatorToFilterBy: Developer;
        let snippetToSkip: SnippetListDtoType['output']['items'][number];

        beforeAll(async () => {
            await developerClient.asAnonymousUser();
            // developer at index 0 has set of snippets that don't change
            // the only set of snippets he has is the ones added when calling `server.init`
            creatorToFilterBy = server.state.developers[0];
        });

        it('should be limited to take option', async () => {
            const searchParams = transformInputToSearchParams({
                take: 1,
            } satisfies SnippetListDtoType['input']);

            const res = await developerClient.fetch(`/snippets?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as SnippetListDtoType['output'];

            expect(result.items.length).toBe(1);

            snippetToSkip = result.items[0];
        });

        it('should be limited to skip & take options', async () => {
            const searchParams = transformInputToSearchParams({
                take: 1,
                skip: 1,
            } satisfies SnippetListDtoType['input']);

            const res = await developerClient.fetch(`/snippets?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as SnippetListDtoType['output'];

            expect(result.items.length).toBe(1);
            if (snippetToSkip?.id) {
                expect(result.items[0].id).not.toBe(snippetToSkip.id);
            }
        });

        it('should filter by creator Id', async () => {
            const creatorSnippets = server.state.snippets.filter(
                s => s.creator.id === creatorToFilterBy.id && s.isPrivate === false,
            );

            const searchParams = transformInputToSearchParams({
                creator: creatorToFilterBy.id,
            } satisfies SnippetListDtoType['input']);

            const res = await developerClient.fetch(`/snippets?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as SnippetListDtoType['output'];

            expect(result.items.length).toBe(creatorSnippets.length);
            if (result.items.length > 0) {
                const item = result.items[0];
                assertPrivateFieldsAbsent(item);
            }
        });

        it('should filter by grouped filters', async () => {
            const targetSnippets = server.state.snippets.filter(
                s =>
                    s.creator.id === creatorToFilterBy.id && s.allowForking === true && s.isPrivate === false,
            );

            const searchParams = transformInputToSearchParams({
                filter: {
                    _and: [{ isPrivate: { equals: false } }, { allowForking: { equals: true } }],
                },
                creator: creatorToFilterBy.id,
            } satisfies SnippetListDtoType['input']);

            const res = await developerClient.fetch(`/snippets?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as SnippetListDtoType['output'];

            expect(result.items.length).toBe(targetSnippets.length);
            if (result.items.length > 0) {
                const item = result.items[0];
                assertPrivateFieldsAbsent(item);
            }
        });
    });

    describe('listing snippets as an authenticated user', () => {
        let authenticatedDeveloper: Developer;
        const password = 'test';

        beforeAll(async () => {
            authenticatedDeveloper = server.state.developers[0];
            await developerClient.asUserWithCredentials(authenticatedDeveloper.emailAddress, password);
        });

        it('should list my snippets respecting take and skip options', async () => {
            const searchParams = transformInputToSearchParams({
                take: 1,
                skip: 0,
            } satisfies CurrentUserSnippetListDtoType['input']);

            const res = await developerClient.fetch(`/snippets/me?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CurrentUserSnippetListDtoType['output'];
            expect(result.items.length).toBe(1);
            if (result.items.length) {
                const item = result.items[0];
                assertPrivateFieldsExist(item);
            }
        });

        it('should list my snippets and apply filters', async () => {
            const targetCount = server.state.snippets.filter(
                s => s.creator.id === authenticatedDeveloper.id && s.isPrivate === true,
            )?.length;

            const searchParams = transformInputToSearchParams({
                filter: {
                    isPrivate: {
                        equals: true,
                    },
                },
            } satisfies CurrentUserSnippetListDtoType['input']);

            const res = await developerClient.fetch(`/snippets/me?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CurrentUserSnippetListDtoType['output'];
            expect(result.itemsCount).toBe(targetCount);
            if (result.items.length) {
                const item = result.items[0];
                assertPrivateFieldsExist(item);
            }
        });

        it('should list my snippets and apply grouped filters', async () => {
            const targetCount = server.state.snippets.filter(
                s =>
                    s.creator.id === authenticatedDeveloper.id &&
                    (s.isPrivate === false || s.allowForking === true),
            )?.length;

            const searchParams = transformInputToSearchParams({
                filter: {
                    _or: [
                        {
                            isPrivate: {
                                equals: false,
                            },
                        },
                        {
                            allowForking: {
                                equals: true,
                            },
                        },
                    ],
                },
            } satisfies CurrentUserSnippetListDtoType['input']);

            const res = await developerClient.fetch(`/snippets/me?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CurrentUserSnippetListDtoType['output'];
            expect(result.itemsCount).toBe(targetCount);
            if (result.items.length) {
                const item = result.items[0];
                assertPrivateFieldsExist(item);
            }
        });

        it("should list other developers' snippets, enforces public only filter (if not owner) and apply other filters", async () => {
            const otherDeveloper = server.state.developers[1];

            const developerSnippetsRes = await developerClient.fetch(
                `/snippets?${transformInputToSearchParams({ creator: otherDeveloper.id }).toString()}`,
                { method: 'GET' },
            );

            // this endpoint returns only public snippets where snippets with {isPrivate:true} are excluded
            // the endpoint should enforce {isPublic: false} only results since current user is not owner
            // so if applied filter {isPrivate: true}, the results should match the results returned by this endpoint
            // this proves enforcement

            const developerSnippets = (await developerSnippetsRes.json()) as SnippetListDtoType['output'];

            const searchParams = transformInputToSearchParams({
                filter: {
                    isPrivate: {
                        equals: true,
                    },
                },
                creator: otherDeveloper.id,
            } satisfies SnippetListDtoType['input']);

            const res = await developerClient.fetch(`/snippets?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as SnippetListDtoType['output'];

            expect(result.items.length).toBe(developerSnippets.items.length);

            if (result.items.length) {
                const item = result.items[0];
                assertPrivateFieldsAbsent(item);
            }
        });

        it("should list my friends' snippets while respecting take option", async () => {
            const currentUserFriendships = server.state.friendships.filter(
                f =>
                    (f.requester.id === authenticatedDeveloper.id ||
                        f.addressee.id === authenticatedDeveloper.id) &&
                    f.status === FriendshipStatus.Accepted,
            );
            const friendIds = currentUserFriendships.map(friendship =>
                friendship.requester.id === authenticatedDeveloper.id
                    ? friendship.addressee.id
                    : friendship.requester.id,
            );

            const searchParams = transformInputToSearchParams({
                take: 1,
            } satisfies UserFriendsSnippetsListDtoType['input']);

            const res = await developerClient.fetch(`/snippets/friends?${searchParams.toString()}`, {
                method: 'GET',
            });

            const result = (await res.json()) as UserFriendsSnippetsListDtoType['output'];

            expect(result.items.length).toBe(1);
            expect(result.items[0].creator.id).toBeOneOf(friendIds);
            assertPrivateFieldsAbsent(result.items[0]);
        });

        it("should list creator's friends' snippets while respecting take option", async () => {
            const creator = server.state.developers[1];
            const creatorFriendships = server.state.friendships.filter(
                f =>
                    (f.requester.id === creator.id || f.addressee.id === creator.id) &&
                    f.status === FriendshipStatus.Accepted,
            );

            const friendIds = creatorFriendships.map(friendship =>
                friendship.requester.id === creator.id ? friendship.addressee.id : friendship.requester.id,
            );

            const searchParams = transformInputToSearchParams({
                take: 1,
                creator: creator.id,
            } satisfies UserFriendsSnippetsListDtoType['input']);

            const res = await developerClient.fetch(`/snippets/friends?${searchParams.toString()}`, {
                method: 'GET',
            });

            const result = (await res.json()) as UserFriendsSnippetsListDtoType['output'];

            expect(result.items.length).toBe(1);
            expect(result.items[0].creator.id).toBeOneOf(friendIds);
            assertPrivateFieldsAbsent(result.items[0]);
        });
    });

    describe('finding snippet by id as an authenticated user', () => {
        let authenticatedDeveloper: Developer;
        const password = 'test';
        let snippet: Snippet;

        beforeAll(async () => {
            authenticatedDeveloper = server.state.developers[0];
            await developerClient.asUserWithCredentials(authenticatedDeveloper.emailAddress, password);
            snippet = server.state.snippets.filter(s => s.creator.id === authenticatedDeveloper.id)?.[0];
        });

        it('should view public and private snippet fields if the owner', async () => {
            const res = await developerClient.fetch(`/snippets/${snippet.id}`, {
                method: 'GET',
            });
            const result = (await res.json()) as FindOneSnippetDtoType['output'];
            expect(result.id).toBe(snippet.id);
            assertPrivateFieldsExist(result);
        });
    });

    describe('finding snippet by id as a non-authenticated user', () => {
        let snippet: Snippet;

        beforeAll(async () => {
            await developerClient.asAnonymousUser();
            snippet = server.state.snippets.filter(s => s.creator.id === server.state.developers[1].id)?.[0];
        });

        it('should only view public snippet fields', async () => {
            const res = await developerClient.fetch(`/snippets/${snippet.id}`, {
                method: 'GET',
            });
            const result = (await res.json()) as FindOneSnippetDtoType['output'];
            expect(result.id).toBe(snippet.id);
            assertPrivateFieldsAbsent(result);
        });
    });
});

function assertPrivateFieldsExist(collection: any) {
    // current user is the owner of the snippets
    // so no restrictions should exist on accessing data
    expect(collection.updatedAt).toBeDefined();
    expect(collection.deletedAt).toBeDefined();
    expect(collection.isPrivate).toBeDefined();
}

function assertPrivateFieldsAbsent(collection: any) {
    // if user is un-authenticated, the set of snippets returned
    // must strip out fields that only belongs to the owner of the snippets
    expect(collection.isPrivate).not.toBeDefined();
    expect(collection.deletedAt).not.toBeDefined();
    expect(collection.updatedAt).not.toBeDefined();
}
