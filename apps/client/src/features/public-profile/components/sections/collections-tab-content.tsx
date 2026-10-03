import { listCreatorCollectionsQueryOption } from '@/features/collection-listing/lib/collection-listing-query-options';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

export function CollectionsTabContent() {
    const { id } = useParams({ from: '/(public)/profile/$id' });
    const { data } = useSuspenseInfiniteQuery(listCreatorCollectionsQueryOption(id));
    const collections = data.pages.flatMap(p => p?.items) ?? [];
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
            ))}
        </div>
    );
}
