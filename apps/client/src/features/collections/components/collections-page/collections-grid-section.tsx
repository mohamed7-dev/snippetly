import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { useFilter } from '@/components/filter-menu';
import { Button } from '@/components/ui/button';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { getCurrentUserCollectionsOptions } from '../../lib/list-collections-query-options';
import { CollectionCard } from '../collection-card';

export function CollectionsGridSection() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        getCurrentUserCollectionsOptions,
    );
    const collections = data.pages?.flatMap(page => page.items) ?? [];

    // filter
    const { filter } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_error-boundary/collections/',
    });
    const filteredCollections = useFilter({ data: collections, filter });

    const qClient = useQueryClient();
    const onDeleteSuccess = () => {
        qClient.invalidateQueries({ queryKey: ['users', 'current', 'dashboard'] });
    };
    return (
        <React.Fragment>
            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCollections.map(collection => (
                    <CollectionCard
                        key={collection.publicId}
                        collection={{
                            ...collection,
                            creatorName: collection.creator.username,
                            snippetsCount: collection.snippetsCount,
                        }}
                        deleteCollection={{
                            onSuccess: onDeleteSuccess,
                        }}
                    />
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isManual={true}
                Content={
                    !filteredCollections.length ? (
                        <StatusCard
                            variant="empty"
                            title="No collections yet"
                            description="Create your first collection to organize your code snippets"
                            layout="section"
                            actions={
                                <Button asChild>
                                    <Link to={'/dashboard/collections/new'}>
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Create Collection
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
