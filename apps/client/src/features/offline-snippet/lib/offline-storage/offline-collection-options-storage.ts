import { MAX_CACHED_COLLECTIONS_PER_OWNER, offlineSnippetlyDb } from './offline-database';
import type { OfflineCollectionOption } from './store-types';

/**
 * @description
 * Caches a bounded set of collection options for offline creation and editing forms.
 *
 * :::info
 * this store caches:
 * - any collection that gets persisted on the server successfully.
 * :::
 */
export async function cacheOfflineCollectionOptions(collections: OfflineCollectionOption[]): Promise<void> {
    if (collections.length === 0) return;
    const cachedAt = new Date();
    const ownerId = collections[0].ownerId;
    await offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.cachedCollectionOptions, async () => {
        await offlineSnippetlyDb.cachedCollectionOptions.bulkPut(
            collections.map(collection => ({ ...collection, cachedAt })),
        );
        const ownerCollections = await offlineSnippetlyDb.cachedCollectionOptions
            .where('ownerId')
            .equals(ownerId)
            .toArray();
        ownerCollections.sort(
            (left, right) => (right.cachedAt?.getTime() ?? 0) - (left.cachedAt?.getTime() ?? 0),
        );
        const evicted = ownerCollections.slice(MAX_CACHED_COLLECTIONS_PER_OWNER);
        if (evicted.length) {
            await offlineSnippetlyDb.cachedCollectionOptions.bulkDelete(
                evicted.map(collection => [collection.id, collection.ownerId]),
            );
        }
    });
}

/**
 * @description
 * Lists cached and pending collection options for the specified owner.
 */
export async function listOfflineCollectionOptions(ownerId: string): Promise<OfflineCollectionOption[]> {
    const [cached, pending] = await Promise.all([
        offlineSnippetlyDb.cachedCollectionOptions.where('ownerId').equals(ownerId).toArray(),
        offlineSnippetlyDb.pendingCollectionCreations.where('ownerId').equals(ownerId).toArray(),
    ]);
    const options = new Map(cached.map(collection => [collection.id, collection]));
    for (const collection of pending) {
        options.set(collection.id, {
            id: collection.id,
            name: collection.input.name,
            color: collection.input.color,
            ownerId,
            isPending: true,
        });
    }
    return [...options.values()];
}
