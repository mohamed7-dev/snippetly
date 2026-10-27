/**
 * @description
 * Applies permitted edits to cached entities and queues them for later server synchronization.
 */
import type { ApiSuccess } from '@/lib/api-client';
import type {
    FindOneCollectionDtoType,
    FindOneSnippetDtoType,
    UpdateCollectionDtoType,
    UpdateSnippetDtoType,
} from '@snippetly/common/dto';
import { registerOfflineMutationSync } from '../register-background-sync';
import { patchCachedListItems } from './offline-dashboard-storage';
import { offlineSnippetlyDb } from './offline-database';
import type { PendingOfflineCollectionUpdate, PendingOfflineSnippetUpdate } from './store-types';

type UpdateCollectionInput = UpdateCollectionDtoType['input'];
type UpdateSnippetInput = UpdateSnippetDtoType['input'];

/**
 * @description
 * Applies a collection edit to cached detail and list data, then queues it for synchronization.
 */
export async function queueOfflineCollectionUpdate(
    ownerId: string,
    input: UpdateCollectionInput,
): Promise<ApiSuccess<UpdateCollectionDtoType['output']>> {
    const updatedAt = new Date();
    const collection = await offlineSnippetlyDb.transaction(
        'rw',
        offlineSnippetlyDb.dashboardCache,
        offlineSnippetlyDb.pendingCollectionUpdates,
        async () => {
            const entry = await offlineSnippetlyDb.dashboardCache.get([
                ownerId,
                'collection-details',
                input.id,
            ]);
            if (!entry) {
                throw new Error(`Collection ${input.id} is not available in the offline cache.`);
            }
            const current = entry.data as ApiSuccess<FindOneCollectionDtoType['output']>;
            if (current.creator.id !== ownerId) {
                throw new Error(`Collection ${input.id} is not owned by the signed-in user.`);
            }
            if (!('updatedAt' in current && 'deletedAt' in current)) {
                throw new Error(`Collection ${input.id} is not available for offline editing.`);
            }
            const { tags } = input;
            const fields: Partial<Omit<UpdateCollectionInput, 'id' | 'tags'>> = input;
            const updated = {
                ...current,
                ...fields,
                ...(tags !== undefined ? { tags: tags.map(value => ({ value })) } : {}),
            };
            const pending = await offlineSnippetlyDb.pendingCollectionUpdates.get([input.id, ownerId]);
            await offlineSnippetlyDb.dashboardCache.put({ ...entry, data: updated, updatedAt });
            await patchCachedListItems(
                ownerId,
                ['collections', 'favourite-collections'],
                input.id,
                fields,
                tags,
            );
            await offlineSnippetlyDb.pendingCollectionUpdates.put({
                id: input.id,
                ownerId,
                input: { ...pending?.input, ...input },
                createdAt: pending?.createdAt ?? updatedAt,
            });
            return updated;
        },
    );
    void registerOfflineMutationSync().catch(error => {
        console.error('Could not register background collection update sync.', error);
    });
    return collection;
}

/**
 * @description
 * Applies a snippet edit to cached detail and list data, then queues it for synchronization.
 */
export async function queueOfflineSnippetUpdate(
    ownerId: string,
    input: UpdateSnippetInput,
): Promise<ApiSuccess<UpdateSnippetDtoType['output']>> {
    const updatedAt = new Date();
    const snippet = await offlineSnippetlyDb.transaction(
        'rw',
        offlineSnippetlyDb.dashboardCache,
        offlineSnippetlyDb.pendingSnippetUpdates,
        async () => {
            const entry = await offlineSnippetlyDb.dashboardCache.get([ownerId, 'snippet-details', input.id]);
            if (!entry) {
                throw new Error(`Snippet ${input.id} is not available in the offline cache.`);
            }
            const current = entry.data as ApiSuccess<FindOneSnippetDtoType['output']>;
            if (current.creator.id !== ownerId || !('isPrivate' in current)) {
                throw new Error(`Snippet ${input.id} is not available for offline editing.`);
            }
            const { tags, collectionId } = input;
            const fields: Partial<Omit<UpdateSnippetInput, 'id' | 'tags' | 'collectionId'>> = input;
            const updated: ApiSuccess<UpdateSnippetDtoType['output']> = {
                ...current,
                ...fields,
                ...(tags !== undefined ? { tags: tags.map(value => ({ value })) } : {}),
                ...(collectionId !== undefined
                    ? {
                          collection:
                              current.collection?.id === collectionId
                                  ? current.collection
                                  : { id: collectionId, name: '', slug: '', color: '' },
                      }
                    : {}),
            };
            const pending = await offlineSnippetlyDb.pendingSnippetUpdates.get([input.id, ownerId]);
            await offlineSnippetlyDb.dashboardCache.put({ ...entry, data: updated, updatedAt });
            await patchCachedListItems(
                ownerId,
                ['snippets', 'favourite-snippets'],
                input.id,
                {
                    ...fields,
                    ...(collectionId !== undefined ? { collection: updated.collection } : {}),
                },
                tags,
            );
            await offlineSnippetlyDb.pendingSnippetUpdates.put({
                id: input.id,
                ownerId,
                input: { ...pending?.input, ...input },
                createdAt: pending?.createdAt ?? updatedAt,
            });
            return updated;
        },
    );
    void registerOfflineMutationSync().catch(error => {
        console.error('Could not register background snippet update sync.', error);
    });
    return snippet;
}

/**
 * @description
 * Lists queued offline collection updates for an owner.
 */
export async function listPendingOfflineCollectionUpdates(
    ownerId: string,
): Promise<PendingOfflineCollectionUpdate[]> {
    return offlineSnippetlyDb.pendingCollectionUpdates.where('ownerId').equals(ownerId).toArray();
}

/**
 * @description
 * Lists queued offline snippet updates for an owner.
 */
export async function listPendingOfflineSnippetUpdates(
    ownerId: string,
): Promise<PendingOfflineSnippetUpdate[]> {
    return offlineSnippetlyDb.pendingSnippetUpdates.where('ownerId').equals(ownerId).toArray();
}

/**
 * @description
 * Records the latest synchronization error for a pending collection update.
 */
export async function updatePendingOfflineCollectionUpdate(
    update: PendingOfflineCollectionUpdate,
    lastError: string,
): Promise<void> {
    await offlineSnippetlyDb.pendingCollectionUpdates.put({ ...update, lastError });
}

/**
 * @description
 * Records the latest synchronization error for a pending snippet update.
 */
export async function updatePendingOfflineSnippetUpdate(
    update: PendingOfflineSnippetUpdate,
    lastError: string,
): Promise<void> {
    await offlineSnippetlyDb.pendingSnippetUpdates.put({ ...update, lastError });
}

/**
 * @description
 * Removes a collection update after the server confirms it was applied.
 */
export async function completePendingOfflineCollectionUpdate(
    update: PendingOfflineCollectionUpdate,
): Promise<void> {
    await offlineSnippetlyDb.pendingCollectionUpdates.delete([update.id, update.ownerId]);
}

/**
 * @description
 * Removes a snippet update after the server confirms it was applied.
 */
export async function completePendingOfflineSnippetUpdate(
    update: PendingOfflineSnippetUpdate,
): Promise<void> {
    await offlineSnippetlyDb.pendingSnippetUpdates.delete([update.id, update.ownerId]);
}
