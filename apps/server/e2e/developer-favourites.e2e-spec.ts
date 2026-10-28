import {
    CollectionListDtoType,
    CreateCollectionDtoType,
    CreateSnippetDtoType,
    DeveloperListDtoType,
    FavouriteCollectionsListDtoType,
    FavouriteDevelopersListDtoType,
    FavouriteSnippetsListDtoType,
    LanguageCode,
    SnippetListDtoType,
    SortDirection,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { Developer, mergeConfig } from '@snippetly/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { getE2ETestSetupTimeout } from '../../../e2e-common/e2e-common-utils';
import { testConfig } from '../../../e2e-common/test-config';
import { createTestEnvironment } from './support/create-test-environment';
import { TestEmailTransporter } from './utils/test-email-transporter.strategy';
import { TestPasswordValidationStrategy } from './utils/test-password-validation.strategy';

describe('Developer Favourite Workflows', () => {
    const { server, developerClient } = createTestEnvironment(
        mergeConfig(
            {
                auth: {
                    requireVerification: false,
                    passwordValidationStrategy: new TestPasswordValidationStrategy(),
                },
                system: {
                    email: {
                        emailTransporterStrategy: new TestEmailTransporter(vi.fn()),
                    },
                },
            },
            testConfig(),
        ),
    );

    let authenticatedDeveloper: Developer;
    let otherDeveloper: Developer;
    let targetSnippetId: string;
    let targetCollectionId: string;
    let secondSnippetId: string;
    let secondCollectionId: string;
    let ownedSnippetId: string;
    let ownedCollectionId: string;

    beforeAll(async () => {
        await server.init({
            initialData: {
                defaultLanguageCode: LanguageCode.English,
                roles: [],
                collections: [],
                snippets: [],
            },
            developerCount: 2,
            logging: true,
        });
        authenticatedDeveloper = server.state.developers[1];
        otherDeveloper = server.state.developers[0];
        const snippet = server.state.snippets.find(item => item.creator.id === otherDeveloper.id);
        const collection = server.state.collections.find(item => item.creator.id === otherDeveloper.id);
        const ownedSnippet = server.state.snippets.find(
            item => item.creator.id === authenticatedDeveloper.id,
        );
        const ownedCollection = server.state.collections.find(
            item => item.creator.id === authenticatedDeveloper.id,
        );
        if (!snippet || !collection || !ownedSnippet || !ownedCollection) {
            throw new Error('Failed to initialize favourite test resources');
        }
        targetSnippetId = snippet.id;
        targetCollectionId = collection.id;
        ownedSnippetId = ownedSnippet.id;
        ownedCollectionId = ownedCollection.id;

        const authenticationResult = await developerClient.asUserWithCredentials(
            authenticatedDeveloper.emailAddress,
            'test',
        );
        if ('code' in authenticationResult) {
            throw new Error(
                `Failed to authenticate favourite test developer: ${JSON.stringify(authenticationResult)}`,
            );
        }
        const currentDeveloperResponse = await developerClient.fetch('/developers/me');
        const currentDeveloper = await currentDeveloperResponse.json();
        if (!currentDeveloperResponse.ok || currentDeveloper.id !== authenticatedDeveloper.id) {
            throw new Error(
                `Failed to authenticate favourite test developer: ${JSON.stringify(currentDeveloper)}`,
            );
        }

        await developerClient.asUserWithCredentials(otherDeveloper.emailAddress, 'test');
        const secondSnippetResponse = await developerClient.fetch('/snippets', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Second favourite test snippet',
                slug: 'second-favourite-test-snippet',
                language: 'typescript',
                code: 'const second = true;',
                tags: ['favourite-pagination'],
            } satisfies CreateSnippetDtoType['input']),
        });
        const secondSnippet = (await secondSnippetResponse.json()) as CreateSnippetDtoType['output'];
        if (!('id' in secondSnippet)) {
            throw new Error(`Failed to create second test snippet: ${JSON.stringify(secondSnippet)}`);
        }
        secondSnippetId = secondSnippet.id;

        const secondCollectionResponse = await developerClient.fetch('/collections', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Second favourite test collection',
                slug: 'second-favourite-test-collection',
                color: '#123456',
                tags: ['favourite-pagination'],
            } satisfies CreateCollectionDtoType['input']),
        });
        const secondCollection = (await secondCollectionResponse.json()) as CreateCollectionDtoType['output'];
        if (!('id' in secondCollection)) {
            throw new Error(`Failed to create second test collection: ${JSON.stringify(secondCollection)}`);
        }
        secondCollectionId = secondCollection.id;
        await developerClient.asUserWithCredentials(authenticatedDeveloper.emailAddress, 'test');
    }, getE2ETestSetupTimeout());

    afterAll(async () => {
        await server.destroy();
    });

    it('favourites and unfavourites public snippets, collections, and developers', async () => {
        for (const [resourceType, id] of [
            ['snippets', targetSnippetId],
            ['snippets', secondSnippetId],
            ['collections', targetCollectionId],
            ['collections', secondCollectionId],
            ['developers', otherDeveloper.id],
        ] as const) {
            const response = await developerClient.fetch(`/favourites/${resourceType}/${id}`, {
                method: 'POST',
            });
            const result = await response.json();
            expect(response.status, JSON.stringify(result)).toBe(200);
            expect(result.success).toBe(true);
        }

        const snippetParams = transformInputToSearchParams({
            take: 10,
            skip: 0,
            filter: { creatorFirstName: { equals: otherDeveloper.firstName } },
            sort: { creatorFirstName: SortDirection.ASC },
        } satisfies FavouriteSnippetsListDtoType['input']);
        const collectionParams = transformInputToSearchParams({
            take: 10,
            skip: 0,
            filter: { creatorFirstName: { equals: otherDeveloper.firstName } },
            sort: { creatorFirstName: SortDirection.ASC },
        } satisfies FavouriteCollectionsListDtoType['input']);
        const [snippetsResponse, collectionsResponse, developersResponse] = await Promise.all([
            developerClient.fetch(`/favourites/snippets?${snippetParams.toString()}`),
            developerClient.fetch(`/favourites/collections?${collectionParams.toString()}`),
            developerClient.fetch('/favourites/developers?take=1&skip=0'),
        ]);

        const snippets = (await snippetsResponse.json()) as FavouriteSnippetsListDtoType['output'];
        const collections = (await collectionsResponse.json()) as FavouriteCollectionsListDtoType['output'];
        const developers = (await developersResponse.json()) as FavouriteDevelopersListDtoType['output'];

        expect(snippetsResponse.status, JSON.stringify(snippets)).toBe(200);
        expect(collectionsResponse.status, JSON.stringify(collections)).toBe(200);
        expect(developersResponse.status, JSON.stringify(developers)).toBe(200);
        expect(snippets.items.some(item => item.id === targetSnippetId)).toBe(true);
        expect(snippets.itemsCount).toBe(2);
        expect(collections.items.some(item => item.id === targetCollectionId)).toBe(true);
        expect(collections.itemsCount).toBe(2);
        expect(developers.items.some(item => item.id === otherDeveloper.id)).toBe(true);
        expect(developers.itemsCount).toBe(1);

        const [snippetDetailResponse, collectionDetailResponse, developerDetailResponse] = await Promise.all([
            developerClient.fetch(`/snippets/${targetSnippetId}`),
            developerClient.fetch(`/collections/${targetCollectionId}`),
            developerClient.fetch(`/developers/${otherDeveloper.id}`),
        ]);
        expect((await snippetDetailResponse.json()).isFavouritedByCurrentUser).toBe(true);
        expect((await collectionDetailResponse.json()).isFavouritedByCurrentUser).toBe(true);
        expect((await developerDetailResponse.json()).isFavouritedByCurrentUser).toBe(true);

        const [snippetListingResponse, collectionListingResponse, developerListingResponse] =
            await Promise.all([
                developerClient.fetch(`/snippets?creator=${otherDeveloper.id}`),
                developerClient.fetch(`/collections?creator=${otherDeveloper.id}`),
                developerClient.fetch('/developers'),
            ]);
        const snippetListing = (await snippetListingResponse.json()) as SnippetListDtoType['output'];
        const collectionListing = (await collectionListingResponse.json()) as CollectionListDtoType['output'];
        const developerListing = (await developerListingResponse.json()) as DeveloperListDtoType['output'];
        expect(
            snippetListing.items.find(item => item.id === targetSnippetId)?.isFavouritedByCurrentUser,
        ).toBe(true);
        expect(
            collectionListing.items.find(item => item.id === targetCollectionId)?.isFavouritedByCurrentUser,
        ).toBe(true);
        expect(
            developerListing.items.find(item => item.id === otherDeveloper.id)?.isFavouritedByCurrentUser,
        ).toBe(true);

        const friendshipResponse = await developerClient.fetch('/friendships/current');
        const friendships = await friendshipResponse.json();
        expect(friendshipResponse.status).toBe(200);
        const friendship = friendships.items.find(
            (item: { requester: { id: string }; addressee: { id: string } }) =>
                item.requester.id === otherDeveloper.id || item.addressee.id === otherDeveloper.id,
        );
        expect(
            friendship.requester.id === otherDeveloper.id
                ? friendship.requester.isFavouritedByCurrentUser
                : friendship.addressee.isFavouritedByCurrentUser,
        ).toBe(true);

        const nextSnippetParams = transformInputToSearchParams({
            take: 1,
            skip: 1,
            filter: { creatorFirstName: { equals: otherDeveloper.firstName } },
            sort: { creatorFirstName: SortDirection.ASC },
        } satisfies FavouriteSnippetsListDtoType['input']);
        const nextCollectionParams = transformInputToSearchParams({
            take: 1,
            skip: 1,
            filter: { creatorFirstName: { equals: otherDeveloper.firstName } },
            sort: { creatorFirstName: SortDirection.ASC },
        } satisfies FavouriteCollectionsListDtoType['input']);
        const [nextSnippetsResponse, nextCollectionsResponse] = await Promise.all([
            developerClient.fetch(`/favourites/snippets?${nextSnippetParams.toString()}`),
            developerClient.fetch(`/favourites/collections?${nextCollectionParams.toString()}`),
        ]);
        const nextSnippets = (await nextSnippetsResponse.json()) as FavouriteSnippetsListDtoType['output'];
        const nextCollections =
            (await nextCollectionsResponse.json()) as FavouriteCollectionsListDtoType['output'];
        expect(nextSnippets.items).toHaveLength(1);
        expect(nextCollections.items).toHaveLength(1);

        const taggedSnippetsParams = transformInputToSearchParams({
            take: 1,
            skip: 0,
            tags: { values: ['favourite-pagination'] },
        } satisfies FavouriteSnippetsListDtoType['input']);
        const taggedCollectionsParams = transformInputToSearchParams({
            take: 1,
            skip: 0,
            tags: { values: ['favourite-pagination'] },
        } satisfies FavouriteCollectionsListDtoType['input']);
        const [taggedSnippetsResponse, taggedCollectionsResponse] = await Promise.all([
            developerClient.fetch(`/favourites/snippets?${taggedSnippetsParams.toString()}`),
            developerClient.fetch(`/favourites/collections?${taggedCollectionsParams.toString()}`),
        ]);
        const taggedSnippets =
            (await taggedSnippetsResponse.json()) as FavouriteSnippetsListDtoType['output'];
        const taggedCollections =
            (await taggedCollectionsResponse.json()) as FavouriteCollectionsListDtoType['output'];
        expect(taggedSnippets.itemsCount).toBe(1);
        expect(taggedCollections.itemsCount).toBe(1);

        for (const [resourceType, id] of [
            ['snippets', targetSnippetId],
            ['snippets', secondSnippetId],
            ['collections', targetCollectionId],
            ['collections', secondCollectionId],
            ['developers', otherDeveloper.id],
        ] as const) {
            const response = await developerClient.fetch(`/favourites/${resourceType}/${id}`, {
                method: 'DELETE',
            });
            expect(response.status).toBe(200);
            expect((await response.json()).success).toBe(true);
        }
    });

    it('allows favouriting owned snippets and collections, but not the current developer account', async () => {
        for (const [resourceType, id] of [
            ['snippets', ownedSnippetId],
            ['collections', ownedCollectionId],
        ] as const) {
            const response = await developerClient.fetch(`/favourites/${resourceType}/${id}`, {
                method: 'POST',
            });
            expect(response.status).toBe(200);
            expect((await response.json()).success).toBe(true);
        }

        const [snippetResponse, collectionResponse] = await Promise.all([
            developerClient.fetch(`/snippets/${ownedSnippetId}`),
            developerClient.fetch(`/collections/${ownedCollectionId}`),
        ]);
        expect((await snippetResponse.json()).isFavouritedByCurrentUser).toBe(true);
        expect((await collectionResponse.json()).isFavouritedByCurrentUser).toBe(true);

        const selfFavouriteResponse = await developerClient.fetch(
            `/favourites/developers/${authenticatedDeveloper.id}`,
            { method: 'POST' },
        );
        expect(selfFavouriteResponse.status).toBe(403);
        expect((await selfFavouriteResponse.json()).code).toBe('FORBIDDEN_ERROR');
    });
});
