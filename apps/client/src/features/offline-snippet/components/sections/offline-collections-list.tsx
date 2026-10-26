import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { OfflineCollectionCard } from '@/features/offline-snippet/components/shared/offline-collection-card';
import { OfflineSearchBar } from '@/features/offline-snippet/components/shared/offline-search-bar';
import { useOfflineCollectionStore } from '@/features/offline-snippet/hooks/use-offline-collection-store';
import { useEffect, useMemo } from 'react';

type OfflineCollectionsListProps = {
    search: string;
    onSearchChange: (search: string) => void;
    onCountsChange: (counts: { filtered: number; total: number }) => void;
};

export function OfflineCollectionsList({
    search,
    onSearchChange,
    onCountsChange,
}: OfflineCollectionsListProps) {
    const {
        list: { data, isPending },
    } = useOfflineCollectionStore();
    const collections = useMemo(
        () => [...(data ?? [])].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()),
        [data],
    );
    const searchTerm = search.trim().toLocaleLowerCase();
    const filteredCollections = useMemo(
        () =>
            collections.filter(collection =>
                [
                    collection.name,
                    collection.description ?? '',
                    ...(collection.snippets ?? []).flatMap(snippet => [
                        snippet.name,
                        snippet.description ?? '',
                        snippet.code,
                        snippet.language,
                    ]),
                ]
                    .join(' ')
                    .toLocaleLowerCase()
                    .includes(searchTerm),
            ),
        [collections, searchTerm],
    );

    useEffect(() => {
        if (!isPending) {
            onCountsChange({ filtered: filteredCollections.length, total: collections.length });
        }
    }, [collections.length, filteredCollections.length, isPending, onCountsChange]);

    if (isPending) return <SectionLoader message="Loading offline collections..." />;

    if (!collections.length) {
        return (
            <StatusCard
                variant="empty"
                title="No offline collections yet"
                description="Save a collection for offline use and it will appear here with its selected snippets."
                layout="section"
            />
        );
    }

    return (
        <section className="space-y-6">
            <OfflineSearchBar
                label="Search offline collections"
                placeholder="Search collections..."
                value={search}
                onChange={onSearchChange}
            />
            {filteredCollections.length ? (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredCollections.map(collection => (
                        <li key={collection.id}>
                            <OfflineCollectionCard collection={collection} preview linkWholeCard />
                        </li>
                    ))}
                </ul>
            ) : (
                <StatusCard
                    variant="empty"
                    title="No matching collections"
                    description="Try another search to find your saved collections."
                    layout="section"
                />
            )}
        </section>
    );
}
