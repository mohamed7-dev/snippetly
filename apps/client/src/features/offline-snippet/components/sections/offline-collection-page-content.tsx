import { StatusCard } from '@/components/feedback/status-card';
import { OfflineSearchBar } from '@/features/offline-snippet/components/shared/offline-search-bar';
import { OfflineSnippetCard } from '@/features/offline-snippet/components/shared/offline-snippet-card';
import type { OfflineCollectionItem } from '@/features/offline-snippet/lib/store';
import { useEffect, useMemo } from 'react';

export function OfflineCollectionPageContent({
    collection,
    search,
    onSearchChange,
    onFilteredCountChange,
}: {
    collection?: OfflineCollectionItem;
    search: string;
    onSearchChange: (search: string) => void;
    onFilteredCountChange: (count: number) => void;
}) {
    const snippets = collection?.snippets ?? [];
    const searchTerm = search.trim().toLocaleLowerCase();
    const filteredSnippets = useMemo(
        () =>
            snippets.filter(snippet =>
                [snippet.name, snippet.description ?? '', snippet.code, snippet.language]
                    .join(' ')
                    .toLocaleLowerCase()
                    .includes(searchTerm),
            ),
        [snippets, searchTerm],
    );

    useEffect(() => {
        if (collection) onFilteredCountChange(filteredSnippets.length);
    }, [collection, filteredSnippets.length, onFilteredCountChange]);

    if (!collection) {
        return (
            <StatusCard
                variant="empty"
                title="Collection not saved for offline"
                description="This collection isn't in your offline library."
                layout="section"
            />
        );
    }

    return (
        <section className="space-y-6">
            {snippets.length > 0 && (
                <OfflineSearchBar
                    label="Search snippets in this collection"
                    placeholder="Search snippets..."
                    value={search}
                    onChange={onSearchChange}
                />
            )}
            {filteredSnippets.length ? (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredSnippets.map(snippet => (
                        <li key={snippet.id}>
                            <OfflineSnippetCard snippet={snippet} />
                        </li>
                    ))}
                </ul>
            ) : snippets.length ? (
                <StatusCard
                    variant="empty"
                    title="No matching snippets"
                    description="Try another search to find a saved snippet."
                    layout="section"
                />
            ) : (
                <StatusCard
                    variant="empty"
                    title="No snippets in this collection"
                    description="No snippets matched the filters selected when saving this collection."
                    layout="section"
                />
            )}
        </section>
    );
}
