import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { OfflineCollectionCard } from '@/features/offline-snippet/components/shared/offline-collection-card';
import { OfflineSnippetCard } from '@/features/offline-snippet/components/shared/offline-snippet-card';
import { useOfflineCollectionStore } from '@/features/offline-snippet/hooks/use-offline-collection-store';
import { useOfflineSnippetStore } from '@/features/offline-snippet/hooks/use-offline-snippet-store';
import { getOfflineSnippetItems } from '@/features/offline-snippet/lib/offline-snippet-items';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

const PREVIEW_SIZE = 5;

export function OfflineSnippetsList() {
    const {
        list: { data: savedSnippets, isPending: snippetsPending },
    } = useOfflineSnippetStore();
    const {
        list: { data: savedCollections, isPending: collectionsPending },
    } = useOfflineCollectionStore();

    const snippets = useMemo(
        () => getOfflineSnippetItems(savedCollections ?? [], savedSnippets ?? []),
        [savedCollections, savedSnippets],
    );
    const collections = useMemo(
        () =>
            [...(savedCollections ?? [])].sort(
                (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
            ),
        [savedCollections],
    );

    if (snippetsPending || collectionsPending) {
        return <SectionLoader message="Loading offline library..." />;
    }

    return (
        <div className="space-y-10">
            <section className="space-y-4">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-primary">Saved for later</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Offline collections</h2>
                    </div>
                    {collections.length > 0 && (
                        <Button variant="outline" asChild>
                            <Link to="/offline/collections">View all collections</Link>
                        </Button>
                    )}
                </header>
                {collections.length ? (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {collections.slice(0, PREVIEW_SIZE).map(collection => (
                            <li key={collection.id}>
                                <OfflineCollectionCard collection={collection} preview />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <StatusCard
                        variant="empty"
                        title="No offline collections yet"
                        description="Save a collection for offline use and it will appear here."
                        layout="section"
                        actions={
                            <Button asChild>
                                <Link to="/discover" search={{ tab: 'collections' }}>
                                    Discover collections
                                </Link>
                            </Button>
                        }
                    />
                )}
            </section>

            <section className="space-y-4">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-primary">Recently saved</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Offline snippets</h2>
                    </div>
                    {snippets.length > 0 && (
                        <Button variant="outline" asChild>
                            <Link to="/offline/snippets">View all snippets</Link>
                        </Button>
                    )}
                </header>
                {snippets.length ? (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {snippets.slice(0, PREVIEW_SIZE).map(snippet => (
                            <li key={snippet.id}>
                                <OfflineSnippetCard snippet={snippet} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <StatusCard
                        variant="empty"
                        title="No offline snippets yet"
                        description="Save individual snippets to see them here. Snippets saved with collections appear in their collection."
                        layout="section"
                        actions={
                            <Button asChild>
                                <Link to="/discover" search={{ tab: 'snippets' }}>
                                    Discover snippets
                                </Link>
                            </Button>
                        }
                    />
                )}
            </section>
        </div>
    );
}
