/**
 * @description
 * Queues offline collection and snippet creations and manages their synchronization lifecycle.
 */
import type { CreateCollectionDtoType, CreateSnippetDtoType } from '@snippetly/common/dto';
import { registerOfflineMutationSync } from '../register-background-sync';
import { offlineSnippetlyDb } from './offline-database';
import type {
    OfflineCollectionMapping,
    PendingOfflineCollection,
    PendingOfflineSnippet,
} from './store-types';

type CreateCollectionInput = CreateCollectionDtoType['input'];
type CreateSnippetInput = CreateSnippetDtoType['input'];

/**
 * @description
 * Adds a new collection to the local creation queue and schedules background synchronization.
 */
export async function queueOfflineCollectionCreation(
    ownerId: string,
    input: CreateCollectionInput,
): Promise<PendingOfflineCollection> {
    const collection: PendingOfflineCollection = {
        id: crypto.randomUUID(),
        ownerId,
        input,
        createdAt: new Date(),
    };
    await offlineSnippetlyDb.pendingCollectionCreations.add(collection);
    void registerOfflineMutationSync().catch(error => {
        console.error('Could not register background collection sync.', error);
    });
    return collection;
}

/**
 * @description
 * Adds a new snippet to the local creation queue and schedules background synchronization.
 */
export async function queueOfflineSnippetCreation(
    ownerId: string,
    input: CreateSnippetInput,
): Promise<PendingOfflineSnippet> {
    const snippet: PendingOfflineSnippet = {
        id: crypto.randomUUID(),
        ownerId,
        input,
        createdAt: new Date(),
    };
    await offlineSnippetlyDb.pendingSnippetCreations.add(snippet);
    void registerOfflineMutationSync().catch(error => {
        console.error('Could not register background snippet sync.', error);
    });
    return snippet;
}

/**
 * @description
 * Lists queued offline collection creations for an owner.
 */
export async function listPendingOfflineCollectionCreations(
    ownerId: string,
): Promise<PendingOfflineCollection[]> {
    return offlineSnippetlyDb.pendingCollectionCreations.where('ownerId').equals(ownerId).toArray();
}

/**
 * @description
 * Lists queued offline snippet creations for an owner.
 */
export async function listPendingOfflineSnippetCreations(ownerId: string): Promise<PendingOfflineSnippet[]> {
    return offlineSnippetlyDb.pendingSnippetCreations.where('ownerId').equals(ownerId).toArray();
}

/**
 * @description
 * Records the latest synchronization error for a pending collection creation.
 */
export async function updatePendingOfflineCollectionCreations(
    collection: PendingOfflineCollection,
    lastError: string,
): Promise<void> {
    await offlineSnippetlyDb.pendingCollectionCreations.put({ ...collection, lastError });
}

/**
 * @description
 * Records the latest synchronization error for a pending snippet creation.
 */
export async function updatePendingOfflineSnippetCreations(
    snippet: PendingOfflineSnippet,
    lastError: string,
): Promise<void> {
    await offlineSnippetlyDb.pendingSnippetCreations.put({ ...snippet, lastError });
}

/**
 * @description
 * Replaces a locally created collection with its server identity and updates dependent snippets atomically.
 */
export async function completePendingOfflineCollectionCreations(
    collection: PendingOfflineCollection,
    serverId: string,
    serverColor: string,
): Promise<void> {
    await offlineSnippetlyDb.transaction(
        'rw',
        offlineSnippetlyDb.cachedCollectionOptions,
        offlineSnippetlyDb.pendingCollectionCreations,
        offlineSnippetlyDb.pendingSnippetCreations,
        offlineSnippetlyDb.collectionMappings,
        async () => {
            await offlineSnippetlyDb.cachedCollectionOptions.put({
                id: serverId,
                name: collection.input.name,
                color: serverColor,
                ownerId: collection.ownerId,
            });
            const mapping: OfflineCollectionMapping = {
                localId: collection.id,
                ownerId: collection.ownerId,
                serverId,
            };
            await offlineSnippetlyDb.collectionMappings.put(mapping);
            const dependentSnippets = await offlineSnippetlyDb.pendingSnippetCreations
                .where('ownerId')
                .equals(collection.ownerId)
                .toArray();
            await Promise.all(
                dependentSnippets
                    .filter(snippet => snippet.input.collectionId === collection.id)
                    .map(snippet =>
                        offlineSnippetlyDb.pendingSnippetCreations.put({
                            ...snippet,
                            input: { ...snippet.input, collectionId: serverId },
                        }),
                    ),
            );
            await offlineSnippetlyDb.pendingCollectionCreations.delete([collection.id, collection.ownerId]);
        },
    );
}

/**
 * @description
 * Removes a snippet creation after the server confirms it was applied.
 */
export async function completePendingOfflineSnippetCreations(snippet: PendingOfflineSnippet): Promise<void> {
    await offlineSnippetlyDb.pendingSnippetCreations.delete([snippet.id, snippet.ownerId]);
}

/**
 * @description
 * Resolves a local collection ID to its server ID when synchronized.
 */
export async function resolveOfflineCollectionId(
    ownerId: string,
    collectionId: string | undefined,
): Promise<string | undefined> {
    if (!collectionId) return undefined;
    const mapping = await offlineSnippetlyDb.collectionMappings.get([collectionId, ownerId]);
    if (mapping) return mapping.serverId;

    const pending = await offlineSnippetlyDb.pendingCollectionCreations.get([collectionId, ownerId]);
    return pending ? undefined : collectionId;
}

/**
 * @description
 * Checks whether a collection is still waiting for offline creation sync.
 */
export async function hasPendingOfflineCollectionCreations(
    ownerId: string,
    collectionId: string,
): Promise<boolean> {
    return !!(await offlineSnippetlyDb.pendingCollectionCreations.get([collectionId, ownerId]));
}
