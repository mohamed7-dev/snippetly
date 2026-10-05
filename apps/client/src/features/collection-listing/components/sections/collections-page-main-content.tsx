import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { listCurrentUserCollectionsQueryOptions } from '../../lib/collection-listing-query-options';

export function CollectionsPageMainContent() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserCollectionsQueryOptions(),
    );
    const collections = data.pages?.flatMap(page => page.items) ?? [];

    const qClient = useQueryClient();
    const onDeleteSuccess = async () => {
        await qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
    };

    return (
        <React.Fragment>
            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map(collection => (
                    <CollectionCard
                        key={collection.id}
                        collection={collection}
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
                    !collections.length ? (
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
