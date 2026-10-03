import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/components/auth-provider';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { discoverCollectionsQueryOptions } from '../lib/api';

export function CollectionsTabContent() {
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        discoverCollectionsQueryOptions,
    );
    const collections = data.pages?.flatMap(p => p.items) ?? [];
    const filteredCollections = collections.filter(collection => collection.creator.username !== user?.name);

    return (
        <React.Fragment>
            <div className="grid gap-4 lg:grid-cols-2">
                {filteredCollections.map(collection => (
                    <CollectionCard
                        key={collection.publicId}
                        collection={{
                            ...collection,
                            creatorName: collection.creator.username,
                        }}
                    />
                ))}
            </div>
            <InfiniteLoader
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                Content={
                    !filteredCollections.length ? (
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
