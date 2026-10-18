import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    PendingOfflineCollection,
    PendingOfflineCollectionUpdate,
    PendingOfflineSnippet,
    PendingOfflineSnippetUpdate,
} from './store';

const mocks = vi.hoisted(() => ({
    fetch: vi.fn(),
    listCollections: vi.fn(),
    listSnippets: vi.fn(),
    listCollectionUpdates: vi.fn(),
    listSnippetUpdates: vi.fn(),
    completeCollection: vi.fn(),
    completeSnippet: vi.fn(),
    completeCollectionUpdate: vi.fn(),
    completeSnippetUpdate: vi.fn(),
    hasPendingCollection: vi.fn(),
    resolveCollectionId: vi.fn(),
    updateCollection: vi.fn(),
    updateSnippet: vi.fn(),
    updateCollectionUpdate: vi.fn(),
    updateSnippetUpdate: vi.fn(),
    acquireLease: vi.fn(),
    releaseLease: vi.fn(),
    saveCredential: vi.fn(),
    requestOrder: [] as string[],
    requestBodies: [] as string[],
}));

vi.mock('../../../lib/api-client', () => ({
    developerApiClient: { fetchWithToken: mocks.fetch },
}));

vi.mock('./store', () => ({
    completePendingOfflineCollection: mocks.completeCollection,
    completePendingOfflineSnippet: mocks.completeSnippet,
    hasPendingOfflineCollection: mocks.hasPendingCollection,
    listPendingOfflineCollections: mocks.listCollections,
    listPendingOfflineCollectionUpdates: mocks.listCollectionUpdates,
    listPendingOfflineSnippets: mocks.listSnippets,
    listPendingOfflineSnippetUpdates: mocks.listSnippetUpdates,
    resolveOfflineCollectionId: mocks.resolveCollectionId,
    updatePendingOfflineCollection: mocks.updateCollection,
    updatePendingOfflineCollectionUpdate: mocks.updateCollectionUpdate,
    updatePendingOfflineSnippet: mocks.updateSnippet,
    updatePendingOfflineSnippetUpdate: mocks.updateSnippetUpdate,
    completePendingOfflineCollectionUpdate: mocks.completeCollectionUpdate,
    completePendingOfflineSnippetUpdate: mocks.completeSnippetUpdate,
    acquireOfflineSyncLease: mocks.acquireLease,
    releaseOfflineSyncLease: mocks.releaseLease,
    saveOfflineSyncCredential: mocks.saveCredential,
}));

import { apiEndpoints } from '../../../lib/api-endpoints';
import { syncPendingCreations } from './sync-pending-creations';

describe('syncPendingCreations', () => {
    const pendingCollection: PendingOfflineCollection = {
        id: 'local-collection',
        ownerId: 'owner',
        input: { name: 'Offline collection', slug: 'offline-collection', color: '#123456' },
        createdAt: new Date(0),
    };
    const pendingSnippet: PendingOfflineSnippet = {
        id: 'local-snippet',
        ownerId: 'owner',
        input: {
            name: 'Offline snippet',
            slug: 'offline-snippet',
            code: 'console.log("offline")',
            language: 'javascript',
            collectionId: 'local-collection',
        },
        createdAt: new Date(0),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
        let collectionPending = true;
        let leaseHeld = false;
        let snippetInput: PendingOfflineSnippet['input'] | null = pendingSnippet.input;
        mocks.requestOrder.length = 0;
        mocks.requestBodies.length = 0;

        mocks.acquireLease.mockImplementation(async () => {
            if (leaseHeld) return false;
            leaseHeld = true;
            return true;
        });
        mocks.releaseLease.mockImplementation(async () => {
            leaseHeld = false;
        });
        mocks.listCollections.mockImplementation(async () =>
            collectionPending ? [pendingCollection] : [],
        );
        mocks.listSnippets.mockImplementation(async () =>
            snippetInput ? [{ ...pendingSnippet, input: snippetInput }] : [],
        );
        mocks.listCollectionUpdates.mockResolvedValue([]);
        mocks.listSnippetUpdates.mockResolvedValue([]);
        mocks.hasPendingCollection.mockImplementation(
            async (_ownerId: string, collectionId: string) =>
                collectionPending && collectionId === pendingCollection.id,
        );
        mocks.resolveCollectionId.mockImplementation(async (_ownerId: string, collectionId?: string) =>
            collectionId === pendingCollection.id ? 'server-collection' : collectionId,
        );
        mocks.completeCollection.mockImplementation(async () => {
            collectionPending = false;
            if (snippetInput) {
                snippetInput = { ...snippetInput, collectionId: 'server-collection' };
            }
        });
        mocks.completeSnippet.mockImplementation(async () => {
            snippetInput = null;
        });
        mocks.completeCollectionUpdate.mockResolvedValue(undefined);
        mocks.completeSnippetUpdate.mockResolvedValue(undefined);
        mocks.fetch.mockImplementation(async (url: string, options: RequestInit) => {
            mocks.requestOrder.push(url);
            mocks.requestBodies.push(String(options.body));
            if (url === apiEndpoints.collections.create.url) {
                return { id: 'server-collection', color: '#123456' };
            }
            return { id: 'server-snippet' };
        });

    });

    it('syncs the collection before its dependent snippet and replaces the temporary collection id', async () => {
        const result = await syncPendingCreations('owner', 'token');

        expect(result).toEqual({
            collections: 1,
            snippets: 1,
            hasPending: false,
            retryableFailure: false,
        });
        expect(mocks.requestOrder).toEqual([
            apiEndpoints.collections.create.url,
            apiEndpoints.snippets.create.url,
        ]);
        expect(JSON.parse(mocks.requestBodies[1])).toMatchObject({
            collectionId: 'server-collection',
        });
    });

    it('uses the shared lease so concurrent page and worker syncs do not duplicate requests', async () => {
        const [first, second] = await Promise.all([
            syncPendingCreations('owner', 'token'),
            syncPendingCreations('owner', 'token'),
        ]);

        expect([first.collections + first.snippets, second.collections + second.snippets]).toEqual([2, 0]);
        expect([first.hasPending, second.hasPending].filter(Boolean)).toHaveLength(1);
        expect(mocks.fetch).toHaveBeenCalledTimes(2);
    });

    it('reports retryable pending work when connectivity is lost', async () => {
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

        const result = await syncPendingCreations('owner', 'token');

        expect(result).toMatchObject({ hasPending: true, retryableFailure: true });
        expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it('syncs pending collection and snippet updates after creations', async () => {
        const collectionUpdate: PendingOfflineCollectionUpdate = {
            id: 'collection-id',
            ownerId: 'owner',
            input: { id: 'collection-id', name: 'Updated collection' },
            createdAt: new Date(0),
        };
        const snippetUpdate: PendingOfflineSnippetUpdate = {
            id: 'snippet-id',
            ownerId: 'owner',
            input: { id: 'snippet-id', name: 'Updated snippet' },
            createdAt: new Date(0),
        };
        mocks.listCollections.mockResolvedValue([]);
        mocks.listSnippets.mockResolvedValue([]);
        mocks.listCollectionUpdates.mockResolvedValue([collectionUpdate]);
        mocks.listSnippetUpdates.mockResolvedValue([snippetUpdate]);
        mocks.completeCollectionUpdate.mockImplementation(async () => {
            mocks.listCollectionUpdates.mockResolvedValue([]);
        });
        mocks.completeSnippetUpdate.mockImplementation(async () => {
            mocks.listSnippetUpdates.mockResolvedValue([]);
        });

        const result = await syncPendingCreations('owner', 'token');

        expect(result).toMatchObject({ hasPending: false, retryableFailure: false });
        expect(mocks.requestOrder).toEqual([
            apiEndpoints.collections.update.url('collection-id'),
            apiEndpoints.snippets.update.url('snippet-id'),
        ]);
        expect(mocks.requestBodies).toEqual([
            JSON.stringify({ name: 'Updated collection' }),
            JSON.stringify({ name: 'Updated snippet' }),
        ]);
        expect(mocks.completeCollectionUpdate).toHaveBeenCalledWith(collectionUpdate);
        expect(mocks.completeSnippetUpdate).toHaveBeenCalledWith(snippetUpdate);
    });
});
