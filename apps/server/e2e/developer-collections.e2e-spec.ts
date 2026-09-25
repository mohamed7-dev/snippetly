import {
    CollectionListDtoType,
    CreateCollectionDtoType,
    CurrentUserCollectionListDtoType,
    DeleteCollectionDtoType,
    FindOneCollectionDtoType,
    ForkCollectionDtoType,
    UpdateCollectionDtoType,
} from '@snippetly/common/dto';
import { Developer, mergeConfig } from '@snippetly/server';
import { ApiClient, createTestEnvironment } from '@snippetly/testing';
import { afterAll, beforeAll, describe, expect, it, Mock, vi } from 'vitest';
import { getE2ETestSetupTimeout } from '../../../e2e-common/e2e-common-utils';
import { initialData } from '../../../e2e-common/e2e-initial-data';
import { testConfig } from '../../../e2e-common/test-config';
import { authenticatedUserErrorGuard } from './utils/error-guards';
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
        let developers: Developer[];
        let authenticatedUserEmailAddress: string;
        const password = 'test';

        beforeAll(async () => {
            developers = server.state.developers;
            authenticatedUserEmailAddress = developers[0].emailAddress;
            await developerClient.asUserWithCredentials(authenticatedUserEmailAddress, password);
        });

        it('succeeds when listing my collections', async () => {
            const targetCollections = server.state.collections.filter(
                c => c.creator.emailAddress === authenticatedUserEmailAddress,
            );
            const res = await developerClient.fetch('/collections/me', {
                method: 'GET',
            });

            const result = (await res.json()) as CurrentUserCollectionListDtoType['output'];

            expect(result.items).toBeDefined();
            expect(result.itemsCount).toBe(targetCollections.length);
        });

        describe('fulfill CRUD requirements', () => {
            let collection: CreateCollectionDtoType['output'];

            beforeAll(async () => {
                const res = await developerClient.fetch('/collections', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: 'test c',
                        slug: 'test-c',
                        color: 'red',
                    } satisfies CreateCollectionDtoType['input']),
                });
                const result = (await res.json()) as CreateCollectionDtoType['output'];
                collection = result;
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
                // updatedAt exists because the owner is the authenticated user
                // so private fields appear
                expect((result as any).updatedAt).toBeDefined();
            });

            it('succeeds when forking an existing collection', async () => {
                await authenticateCollectionCreator(
                    { emailAddress: server.state.developers[1].emailAddress, password },
                    developerClient,
                );

                const res = await developerClient.fetch(`/collections/${collection.id}/forks`, {
                    method: 'POST',
                });

                const result = (await res.json()) as ForkCollectionDtoType['output'];

                expect(result.id).not.toBe(collection.id);
            });
            it('succeeds when deleting an existing collection', async () => {
                await authenticateCollectionCreator(
                    { emailAddress: authenticatedUserEmailAddress, password },
                    developerClient,
                );
                const res = await developerClient.fetch(`/collections/${collection.id}`, {
                    method: 'DELETE',
                });

                const result = (await res.json()) as DeleteCollectionDtoType['output'];

                expect(result.result).toBe('DELETED');
            });

            it('succeeds when creating a new collection', async () => {
                await authenticateCollectionCreator(
                    { emailAddress: server.state.developers[1].emailAddress, password },
                    developerClient,
                );
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
            });
        });
    });

    describe('listing collections as a non-authenticated user', () => {
        let collectionToSkip: CollectionListDtoType['output']['items'][number];
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
            expect(result.items[0].id).not.toBe(collectionToSkip.id);
        });

        it('should filter by creator Id', async () => {
            const creator = server.state.developers[0];
            const creatorCollections = server.state.collections.filter(
                c => c.creator.id === creator.id && c.isPrivate === false,
            );

            const searchParams = transformInputToSearchParams({
                creator: creator.id,
            } satisfies CollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CollectionListDtoType['output'];

            expect(result.items.length).toBe(creatorCollections.length);
        });

        it('should filter by grouped filters', async () => {
            const creator = server.state.developers[0];

            const targetCollections = server.state.collections.filter(
                c => c.creator.id === creator.id && c.allowForking === true && c.isPrivate === false,
            );

            const searchParams = transformInputToSearchParams({
                filter: {
                    _and: [{ isPrivate: { equals: false } }, { allowForking: { equals: true } }],
                },
                creator: creator.id,
            } satisfies CollectionListDtoType['input']);

            const res = await developerClient.fetch(`/collections?${searchParams.toString()}`, {
                method: 'GET',
            });
            const result = (await res.json()) as CollectionListDtoType['output'];

            expect(result.items.length).toBe(targetCollections.length);
        });
    });
});

async function authenticateCollectionCreator(
    userCredentials: { password?: string; emailAddress: string },
    developerClient: ApiClient,
) {
    const loginResult = await developerClient.asUserWithCredentials(
        userCredentials.emailAddress,
        userCredentials.password ?? 'test',
    );
    authenticatedUserErrorGuard.assertSuccess(loginResult);
}

function transformInputToSearchParams(input: Record<string, unknown>): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(input).forEach(([key, value]) => {
        if (key === 'filter' || key === 'sort') {
            searchParams.set(key, JSON.stringify(value));
        } else {
            searchParams.set(key, `${value as string | number}`);
        }
    });

    return searchParams;
}
