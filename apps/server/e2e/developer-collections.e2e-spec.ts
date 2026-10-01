import {
    CollectionListDtoType,
    CreateCollectionDtoType,
    CurrentUserCollectionListDtoType,
    DeleteCollectionDtoType,
    FindOneCollectionDtoType,
    ForkCollectionDtoType,
    UpdateCollectionDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { Collection, Developer, mergeConfig } from '@snippetly/server';
import { createTestEnvironment } from '@snippetly/testing';
import { afterAll, beforeAll, describe, expect, it, Mock, vi } from 'vitest';
import { getE2ETestSetupTimeout } from '../../../e2e-common/e2e-common-utils';
import { initialData } from '../../../e2e-common/e2e-initial-data';
import { testConfig } from '../../../e2e-common/test-config';
import { TestEmailTransporter } from './utils/test-email-transporter.strategy';
import { TestPasswordValidationStrategy } from './utils/test-password-validation.strategy';

/* Rule
- developer at index 0 should have his collections static, they shouldn't be mutated after server initialization
this is useful in cases where deterministic testing results are targeted.
- developer at index 1 could be used to perform CRUD operations on collections as needed.
*/

let sendEmailFn: Mock;

describe('Developer Collection Workflows', () => {
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

        it('fails when listing my collections', async () => {
            const res = await developerClient.fetch('/collections/me', {
                method: 'GET',
            });

            const result = (await res.json()) as CurrentUserCollectionListDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when creating a new collection', async () => {
            const res = await developerClient.fetch('/collections', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'test c',
                    slug: 'test-c',
                    color: 'red',
                } satisfies CreateCollectionDtoType['input']),
            });

            const result = (await res.json()) as CreateCollectionDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when updating an existing collection', async () => {
            const res = await developerClient.fetch(`/collections/${server.state.collections[0].id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    name: 'updated c',
                } satisfies Omit<UpdateCollectionDtoType['input'], 'id'>),
            });

            const result = (await res.json()) as UpdateCollectionDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when forking an existing collection', async () => {
            const res = await developerClient.fetch(`/collections/${server.state.collections[0].id}/forks`, {
                method: 'POST',
            });

            const result = (await res.json()) as ForkCollectionDtoType['output'];

            expect((result as any).code).toBe('FORBIDDEN_ERROR');
        });

        it('fails when deleting an existing collection', async () => {
            const res = await developerClient.fetch(`/collections/${server.state.collections[0].id}`, {
                method: 'DELETE',
            });

            const result = (await res.json()) as DeleteCollectionDtoType['output'];

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

        it('succeeds when listing my collections', async () => {
            const targetCollections = server.state.collections.filter(
                c => c.creator.emailAddress === authenticatedDeveloper.emailAddress,
            );
            const res = await developerClient.fetch('/collections/me', {
                method: 'GET',
            });

            const result = (await res.json()) as CurrentUserCollectionListDtoType['output'];

            expect(result.items).toBeDefined();
            expect(result.itemsCount).toBe(targetCollections.length);
        });

        describe('fulfill CRUD requirements', () => {
            let collection: Collection;

            beforeAll(() => {
                collection = server.state.collections.filter(
                    c => c.creator.id === authenticatedDeveloper.id,
                )?.[0];
            });

            it('succeeds when updating an existing collection', async () => {
                const res = await developerClient.fetch(`/collections/${collection.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        name: 'updated test c',
                    } satisfies Omit<UpdateCollectionDtoType['input'], 'id'>),
                });

                const result = (await res.json()) as UpdateCollectionDtoType['output'];

                expect(result.name).toBe('updated test c');
            });

            it('succeeds when reading an existing collection', async () => {
                const res = await developerClient.fetch(`/collections/${collection.id}`, {
                    method: 'GET',
                });

                const result = (await res.json()) as FindOneCollectionDtoType['output'];

                expect(result.id).toBe(collection.id);
                assertPrivateFieldsExist(result);
            });

            it('succeeds when forking an existing collection', async () => {
                const res = await developerClient.fetch(`/collections/${collection.id}/forks`, {
                    method: 'POST',
                });

                const result = (await res.json()) as ForkCollectionDtoType['output'];

                expect(result.id).not.toBe(collection.id);
            });

            it('succeeds when creating&deleting a new collection', async () => {
                const res = await developerClient.fetch('/collections', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: 'test c 2',
                        slug: 'test-c-2',
                        color: 'green',
                    } satisfies CreateCollectionDtoType['input']),
                });

                const result = (await res.json()) as CreateCollectionDtoType['output'];

                expect(result.name).toBe('test c 2');

                const deletionRes = await developerClient.fetch(`/collections/${result.id}`, {
                    method: 'DELETE',
                });
                const deletionResult = (await deletionRes.json()) as DeleteCollectionDtoType['output'];

                expect(deletionResult.result).toBe('DELETED');
            });
        });
    });

    describe('performing protected operations as an authenticated user, but not the owner', () => {
        let authenticatedDeveloper: Developer;
        let targetCollectionToMutate: Collection;
        const password = 'test';

        beforeAll(async () => {
            authenticatedDeveloper = server.state.developers[0];
            await developerClient.asUserWithCredentials(authenticatedDeveloper.emailAddress, password);
            targetCollectionToMutate = server.state.collections.filter(
                c => c.creator.id !== authenticatedDeveloper.id,
            )?.[0];
        });

        it('returns only public fields when finding the collection by id', async () => {
            const res = await developerClient.fetch(`/collections/${targetCollectionToMutate.id}`, {
                method: 'GET',
            });
            const result = (await res.json()) as FindOneCollectionDtoType['output'];
            expect(result.id).toBe(targetCollectionToMutate.id);
            assertPrivateFieldsAbsent(result);
        });

        it('fails when updating the collection', async () => {
            const res = await developerClient.fetch(`/collections/${targetCollectionToMutate.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: 'update c name' }),
            });
            const result = await res.json();
            expect((result as any).code).toBe('ENTITY_NOT_FOUND_ERROR');
        });

        it('fails when deleting the collection', async () => {
            const res = await developerClient.fetch(`/collections/${targetCollectionToMutate.id}`, {
                method: 'DELETE',
            });
            const result = (await res.json()) as DeleteCollectionDtoType['output'];
            expect(result.result).toBe('NOT_DELETED');
        });
    });

    describe('listing collections as a non-authenticated user', () => {
        let creatorToFilterBy: Developer;
        let collectionToSkip: CollectionListDtoType['output']['items'][number];

        beforeAll(async () => {
            await developerClient.asAnonymousUser();
            // developer at index 0 has set of collections that don't change
            // the only set of collections he has is the ones added when calling `server.init`
            creatorToFilterBy = server.state.developers[0];
        });

        it('should be limited to take option', async () => {
            const searchParams = transformInputToSearchParams({
                take: 1,
            } satisfies CollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CollectionListDtoType['output'];

            expect(result.items.length).toBe(1);

            collectionToSkip = result.items[0];
        });

        it('should be limited to skip & take options', async () => {
            const searchParams = transformInputToSearchParams({
                take: 1,
                skip: 1,
            } satisfies CollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CollectionListDtoType['output'];

            expect(result.items.length).toBe(1);
            if (collectionToSkip?.id) {
                expect(result.items[0].id).not.toBe(collectionToSkip.id);
            }
        });

        it('should filter by creator Id', async () => {
            const creatorCollections = server.state.collections.filter(
                c => c.creator.id === creatorToFilterBy.id && c.isPrivate === false,
            );

            const searchParams = transformInputToSearchParams({
                creator: creatorToFilterBy.id,
            } satisfies CollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CollectionListDtoType['output'];

            expect(result.items.length).toBe(creatorCollections.length);
            if (result.items.length > 0) {
                const item = result.items[0];
                assertPrivateFieldsAbsent(item);
            }
        });

        it('should filter by grouped filters', async () => {
            const targetCollections = server.state.collections.filter(
                c =>
                    c.creator.id === creatorToFilterBy.id && c.allowForking === true && c.isPrivate === false,
            );

            const searchParams = transformInputToSearchParams({
                filter: {
                    _and: [{ isPrivate: { equals: false } }, { allowForking: { equals: true } }],
                },
                creator: creatorToFilterBy.id,
            } satisfies CollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CollectionListDtoType['output'];

            expect(result.items.length).toBe(targetCollections.length);
            if (result.items.length > 0) {
                const item = result.items[0];
                assertPrivateFieldsAbsent(item);
            }
        });
    });

    describe('listing collections as an authenticated user', () => {
        let authenticatedDeveloper: Developer;
        const password = 'test';

        beforeAll(async () => {
            authenticatedDeveloper = server.state.developers[0];
            await developerClient.asUserWithCredentials(authenticatedDeveloper.emailAddress, password);
        });

        it('should list my collections respecting take and skip options', async () => {
            const searchParams = transformInputToSearchParams({
                take: 1,
                skip: 0,
            } satisfies CurrentUserCollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections/me?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CurrentUserCollectionListDtoType['output'];
            expect(result.items.length).toBe(1);
            if (result.items.length) {
                const item = result.items[0];
                assertPrivateFieldsExist(item);
            }
        });

        it('should list my collections and apply filters', async () => {
            const targetCount = server.state.collections.filter(
                c => c.creator.id === authenticatedDeveloper.id && c.isPrivate === true,
            )?.length;

            const searchParams = transformInputToSearchParams({
                filter: {
                    isPrivate: {
                        equals: true,
                    },
                },
            } satisfies CurrentUserCollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections/me?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CurrentUserCollectionListDtoType['output'];
            expect(result.itemsCount).toBe(targetCount);
            if (result.items.length) {
                const item = result.items[0];
                assertPrivateFieldsExist(item);
            }
        });

        it('should list my collections and apply grouped filters', async () => {
            const targetCount = server.state.collections.filter(
                c =>
                    c.creator.id === authenticatedDeveloper.id &&
                    (c.isPrivate === false || c.allowForking === true),
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
            } satisfies CurrentUserCollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections/me?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CurrentUserCollectionListDtoType['output'];
            expect(result.itemsCount).toBe(targetCount);
            if (result.items.length) {
                const item = result.items[0];
                assertPrivateFieldsExist(item);
            }
        });

        it("should list other developers' collections, enforces public only filter (if not owner) and apply other filters", async () => {
            const otherDeveloper = server.state.developers[1];

            const developerCollectionsRes = await developerClient.fetch(
                `/collections?${transformInputToSearchParams({ creator: otherDeveloper.id }).toString()}`,
                { method: 'GET' },
            );

            // this endpoint returns only public collections where collections with {isPrivate:true} are excluded
            // the endpoint should enforce {isPublic: false} only results since current user is not owner
            // so if applied filter {isPrivate: true}, the results should match the results returned by this endpoint
            // this proves enforcement

            const developerCollections =
                (await developerCollectionsRes.json()) as CollectionListDtoType['output'];

            const searchParams = transformInputToSearchParams({
                filter: {
                    isPrivate: {
                        equals: true,
                    },
                },
                creator: otherDeveloper.id,
            } satisfies CollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CollectionListDtoType['output'];
            expect(result.items.length).toBe(developerCollections.items.length);

            if (result.items.length) {
                const item = result.items[0];
                assertPrivateFieldsAbsent(item);
            }
        });
    });

    describe('finding collection by id as an authenticated user', () => {
        let authenticatedDeveloper: Developer;
        const password = 'test';
        let collection: Collection;

        beforeAll(async () => {
            authenticatedDeveloper = server.state.developers[0];
            await developerClient.asUserWithCredentials(authenticatedDeveloper.emailAddress, password);
            collection = server.state.collections.filter(
                c => c.creator.id === authenticatedDeveloper.id,
            )?.[0];
        });

        it('should view public and private collection fields if the owner', async () => {
            const res = await developerClient.fetch(`/collections/${collection.id}`, {
                method: 'GET',
            });
            const result = (await res.json()) as FindOneCollectionDtoType['output'];
            expect(result.id).toBe(collection.id);
            assertPrivateFieldsExist(result);
        });
    });
});

function assertPrivateFieldsExist(collection: any) {
    // current user is the owner of the collections
    // so no restrictions should exist on accessing data
    expect(collection.updatedAt).toBeDefined();
    expect(collection.deletedAt).toBeDefined();
    expect(collection.isPrivate).toBeDefined();
}

function assertPrivateFieldsAbsent(collection: any) {
    // if user is un-authenticated, the set of collections returned
    // must strip out fields that only belongs to the owner of the collections
    expect(collection.isPrivate).not.toBeDefined();
    expect(collection.deletedAt).not.toBeDefined();
    expect(collection.updatedAt).not.toBeDefined();
}
