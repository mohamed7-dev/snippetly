import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { discoverCollectionsQueryOptions } from '@/features/discover/lib/discover-query-options';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';

export function DiscoverCollectionsList() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        discoverCollectionsQueryOptions(),
    );
    const collections = data.pages?.flatMap(p => p.items) ?? [];

    return (
        <React.Fragment>
            <div className="grid gap-4 lg:grid-cols-2">
                {collections.map(collection => (
                    <CollectionCard key={collection.id} collection={collection} />
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !collections.length ? (
                        <StatusCard
                            variant="empty"
                            title="No collections yet"
                            description="Create your first collection to get started"
                            layout="section"
                            actions={
                                <Button asChild>
                                    <Link to="/dashboard/collections/new">
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        <span>Create Collection</span>
                                    </Link>
                                </Button>
                            }
                        />
                    ) : null
                }
            />
        </React.Fragment>
    );
}
