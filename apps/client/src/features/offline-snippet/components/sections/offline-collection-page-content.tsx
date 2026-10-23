import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { OfflineSearchBar } from '@/features/offline-snippet/components/shared/offline-search-bar';
import { OfflineSnippetCard } from '@/features/offline-snippet/components/shared/offline-snippet-card';
import { useOfflineCollectionStore } from '@/features/offline-snippet/hooks/use-offline-collection-store';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

export function OfflineCollectionPageContent({ id }: { id: string }) {
    const {
        list: { data, isPending },
    } = useOfflineCollectionStore();
    const [search, setSearch] = useState('');
    const collection = data?.find(item => item.id === id);
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

    if (isPending) return <SectionLoader message="Loading offline collection..." />;

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
            <header className="space-y-1">
                <Button variant="link" className="-ml-3 px-3" asChild>
                    <Link to="/offline/collections">
                        <ArrowLeftIcon className="size-4" />
                        Offline collections
                    </Link>
                </Button>
                <p className="text-sm font-medium text-primary">Offline collection</p>
                <h1 className="text-2xl font-semibold tracking-tight">{collection.name}</h1>
                {collection.description && (
                    <p className="text-sm text-muted-foreground">{collection.description}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    {filteredSnippets.length} of {snippets.length} saved snippets
                </p>
            </header>
            {snippets.length > 0 && (
                <OfflineSearchBar
                    label="Search snippets in this collection"
                    placeholder="Search snippets..."
                    value={search}
                    onChange={setSearch}
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
