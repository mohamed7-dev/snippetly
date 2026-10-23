import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { OfflineCollectionCard } from '@/features/offline-snippet/components/shared/offline-collection-card';
import { OfflineSearchBar } from '@/features/offline-snippet/components/shared/offline-search-bar';
import { useOfflineCollectionStore } from '@/features/offline-snippet/hooks/use-offline-collection-store';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

export function OfflineCollectionsList() {
    const {
        list: { data, isPending },
    } = useOfflineCollectionStore();
    const [search, setSearch] = useState('');
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
            <header className="space-y-1">
                <Button variant="link" className="-ml-3 px-3" asChild>
                    <Link to="/offline">
                        <ArrowLeftIcon className="size-4" />
                        Offline library
                    </Link>
                </Button>
                <p className="text-sm font-medium text-primary">Your pocket library</p>
                <h1 className="text-2xl font-semibold tracking-tight">Offline collections</h1>
                <p className="text-sm text-muted-foreground">
                    {filteredCollections.length} of {collections.length} collections
                </p>
            </header>
            <OfflineSearchBar
                label="Search offline collections"
                placeholder="Search collections..."
                value={search}
                onChange={setSearch}
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
