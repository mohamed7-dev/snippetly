import type { OfflineCollectionItem, OfflineSnippetItem } from './store';

export function getOfflineSnippetItems(
    collections: OfflineCollectionItem[],
    explicitlySavedSnippets: OfflineSnippetItem[],
): OfflineSnippetItem[] {
    const snippets = new Map<string, OfflineSnippetItem>();
    for (const collection of collections) {
        for (const snippet of collection.snippets ?? []) {
            snippets.set(snippet.id, snippet);
        }
    }
    for (const snippet of explicitlySavedSnippets) {
        const existing = snippets.get(snippet.id);
        if (!existing || new Date(snippet.savedAt).getTime() >= new Date(existing.savedAt).getTime()) {
            snippets.set(snippet.id, snippet);
        }
    }
    return [...snippets.values()].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
}
