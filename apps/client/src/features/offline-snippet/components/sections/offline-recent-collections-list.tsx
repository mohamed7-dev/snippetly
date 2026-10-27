import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { PREVIEW_SIZE } from '../../lib/constants';
import type { OfflineCollectionItem } from '../../lib/store';
import { OfflineCollectionCard } from '../shared/offline-collection-card';

export function OfflineRecentCollectionsList({
    savedCollections,
}: {
    savedCollections: OfflineCollectionItem[];
}) {
    const collections = useMemo(
        () =>
            [...(savedCollections ?? [])].sort(
                (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
            ),
        [savedCollections],
    );

    return (
        <section className="space-y-6">
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
                <div
                    aria-label="Offline collections"
                    className="-my-2 overflow-x-auto snap-x snap-mandatory py-2"
                    role="region"
                    tabIndex={0}
                >
                    <ul className="flex w-max min-w-full gap-4">
                        {collections.slice(0, PREVIEW_SIZE).map(collection => (
                            <li key={collection.id} className="w-[min(85vw,24rem)] shrink-0 snap-start">
                                <OfflineCollectionCard collection={collection} preview />
                            </li>
                        ))}
                    </ul>
                </div>
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
    );
}
