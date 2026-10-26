import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { OfflineSnippetCard } from '@/features/offline-snippet/components/shared/offline-snippet-card';
import { getOfflineSnippetItems } from '@/features/offline-snippet/lib/offline-snippet-items';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { PREVIEW_SIZE } from '../../lib/constants';
import type { OfflineCollectionItem, OfflineSnippetItem } from '../../lib/store';

export function OfflineRecentSnippetsList({
    savedCollections,
    savedSnippets,
}: {
    savedSnippets: OfflineSnippetItem[];
    savedCollections: OfflineCollectionItem[];
}) {
    const snippets = useMemo(
        () => getOfflineSnippetItems(savedCollections ?? [], savedSnippets ?? []),
        [savedCollections, savedSnippets],
    );

    return (
        <section className="space-y-6">
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
                <div
                    aria-label="Offline snippets"
                    className="-my-2 overflow-x-auto snap-x snap-mandatory py-2"
                    role="region"
                    tabIndex={0}
                >
                    <ul className="flex w-max min-w-full gap-4">
                        {snippets.slice(0, PREVIEW_SIZE).map(snippet => (
                            <li key={snippet.id} className="w-[min(85vw,24rem)] shrink-0 snap-start">
                                <OfflineSnippetCard snippet={snippet} />
                            </li>
                        ))}
                    </ul>
                </div>
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
    );
}
