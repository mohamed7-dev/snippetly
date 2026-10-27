/**
 * @description
 * Persists snippets explicitly saved for offline reading.
 */
import { DEFAULT_OFFLINE_SAVED_BY, offlineSnippetlyDb } from './offline-database';
import {
    type GetOfflineSnippetInput,
    type InsertOfflineSnippetInput,
    type OfflineSnippetItem,
    type RemoveOfflineSnippetInput,
    type UpdateOfflineSnippetInput,
} from './store-types';

/**
 * @description
 * Saves a snippet for the current owner, leaving an existing saved copy unchanged.
 */
export async function insertExplicitOfflineSnippet(snippet: InsertOfflineSnippetInput): Promise<void> {
    const savedBy = snippet.savedBy ?? DEFAULT_OFFLINE_SAVED_BY;
    await offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.explicitSnippets, async () => {
        const current = await offlineSnippetlyDb.explicitSnippets.get([snippet.id, savedBy]);
        if (current) return;

        await offlineSnippetlyDb.explicitSnippets.add({
            ...snippet,
            savedAt: new Date(),
            savedBy,
        });
    });
}

/**
 * @description
 * Removes the specified owner's saved copy of a snippet.
 */
export async function removeExplicitOfflineSnippet(input: RemoveOfflineSnippetInput): Promise<void> {
    const savedBy = input.savedBy ?? DEFAULT_OFFLINE_SAVED_BY;
    await offlineSnippetlyDb.transaction(
        'rw',
        offlineSnippetlyDb.explicitSnippets,
        offlineSnippetlyDb.explicitCollections,
        async () => {
            await offlineSnippetlyDb.explicitSnippets.delete([input.id, savedBy]);

            const collections = await offlineSnippetlyDb.explicitCollections
                .where('savedBy')
                .equals(savedBy)
                .toArray();
            const updatedCollections = collections
                .filter(collection => (collection.snippets ?? []).some(snippet => snippet.id === input.id))
                .map(collection => ({
                    ...collection,
                    snippets: (collection.snippets ?? []).filter(snippet => snippet.id !== input.id),
                }));
            if (updatedCollections.length) {
                await offlineSnippetlyDb.explicitCollections.bulkPut(updatedCollections);
            }
        },
    );
}

/**
 * @description
 * Updates a locally saved snippet without changing its original save timestamp.
 */
export async function updateExplicitOfflineSnippet(patch: UpdateOfflineSnippetInput): Promise<void> {
    const savedBy = patch.savedBy ?? DEFAULT_OFFLINE_SAVED_BY;
    await offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.explicitSnippets, async () => {
        const current = await offlineSnippetlyDb.explicitSnippets.get([patch.id, savedBy]);
        if (!current) return;

        await offlineSnippetlyDb.explicitSnippets.put({
            ...current,
            ...patch,
            id: current.id,
            savedBy: current.savedBy ?? DEFAULT_OFFLINE_SAVED_BY,
            savedAt: current.savedAt,
        });
    });
}

/**
 * @description
 * Retrieves the specified owner's saved copy of a snippet.
 */
export async function getExplicitOfflineSnippet(
    input: GetOfflineSnippetInput,
): Promise<OfflineSnippetItem | undefined> {
    const savedBy = input.savedBy ?? DEFAULT_OFFLINE_SAVED_BY;
    const snippet = await offlineSnippetlyDb.explicitSnippets.get([input.id, savedBy]);
    if (snippet) return snippet;

    const collections = await offlineSnippetlyDb.explicitCollections
        .where('savedBy')
        .equals(savedBy)
        .toArray();
    return collections.flatMap(collection => collection.snippets ?? []).find(item => item.id === input.id);
}

/**
 * @description
 * Lists snippets saved for the supplied owner, or for anonymous use when no owner is given.
 */
export async function listExplicitOfflineSnippets(activeUserId?: string): Promise<OfflineSnippetItem[]> {
    return offlineSnippetlyDb.explicitSnippets
        .where('savedBy')
        .equals(activeUserId ?? DEFAULT_OFFLINE_SAVED_BY)
        .toArray();
}
