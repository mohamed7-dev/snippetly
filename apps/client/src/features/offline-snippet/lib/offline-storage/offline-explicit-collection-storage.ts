/**
 * @description
 * Persists collections saved explicitly for offline reading and lightweight collection options used by offline forms.
 */
import { DEFAULT_OFFLINE_SAVED_BY, offlineSnippetlyDb } from './offline-database';
import {
    type GetOfflineCollectionInput,
    type InsertOfflineCollectionInput,
    type OfflineCollectionItem,
} from './store-types';

/**
 * @description
 * Saves a collection for the current owner, leaving an existing saved copy unchanged.
 */
export async function insertExplicitOfflineCollection(
    collection: InsertOfflineCollectionInput,
): Promise<void> {
    const savedBy = collection.savedBy ?? DEFAULT_OFFLINE_SAVED_BY;
    await offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.explicitCollections, async () => {
        const current = await offlineSnippetlyDb.explicitCollections.get([collection.id, savedBy]);
        if (current) {
            if (current.snippets !== undefined || collection.snippets === undefined) return;

            await offlineSnippetlyDb.explicitCollections.put({
                ...current,
                snippets: collection.snippets,
            });
            return;
        }

        await offlineSnippetlyDb.explicitCollections.add({
            ...collection,
            snippets: collection.snippets ?? [],
            savedAt: new Date(),
            savedBy,
        });
    });
}

/**
 * @description
 * Removes the specified owner's saved copy of a collection.
 */
export async function removeExplicitOfflineCollection(input: GetOfflineCollectionInput): Promise<void> {
    await offlineSnippetlyDb.explicitCollections.delete([
        input.id,
        input.savedBy ?? DEFAULT_OFFLINE_SAVED_BY,
    ]);
}

/**
 * @description
 * Retrieves the specified owner's saved copy of a collection.
 */
export async function getExplicitOfflineCollection(
    input: GetOfflineCollectionInput,
): Promise<OfflineCollectionItem | undefined> {
    return offlineSnippetlyDb.explicitCollections.get([input.id, input.savedBy ?? DEFAULT_OFFLINE_SAVED_BY]);
}

/**
 * @description
 * Lists collections saved for the supplied owner, or for anonymous use when no owner is given.
 */
export async function listExplicitOfflineCollections(
    activeUserId?: string,
): Promise<OfflineCollectionItem[]> {
    return offlineSnippetlyDb.explicitCollections
        .where('savedBy')
        .equals(activeUserId ?? DEFAULT_OFFLINE_SAVED_BY)
        .toArray();
}
