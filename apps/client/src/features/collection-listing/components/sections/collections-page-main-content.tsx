import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { CollectionListLayout } from '@/components/shared/collection-list-layout';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { listCurrentUserCollectionsQueryOptions } from '../../lib/collection-listing-query-options';

export function CollectionsPageMainContent() {
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/collections/',
    });

    const { sort, filter, filterOperator, tags } = search ?? {};

    const queryKey = [sort, filter, filterOperator, tags];

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCurrentUserCollectionsQueryOptions({ sort, filter, filterOperator, tags }, queryKey),
    );
    const collections = data.pages?.flatMap(page => page.items) ?? [];

    const qClient = useQueryClient();

    const onMutateSuccess = async () => {
        await qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions(undefined, queryKey));
    };

    return (
        <React.Fragment>
            <CollectionListLayout>
                {collections.map(collection => (
                    <PermissionGuard
                        key={collection.id}
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.ReadCollection,
                            Permission.Owner,
                        ]}
                        ownerId={collection.creator.id}
                    >
                        <CollectionCard
                            collection={collection}
                            deleteCollection={{
                                onSuccess: onMutateSuccess,
                            }}
                            moveCollectionToTrash={{
                                onSuccess: onMutateSuccess,
                            }}
                            forkCollection={{
                                onSuccess: onMutateSuccess,
                            }}
                        />
                    </PermissionGuard>
                ))}
            </CollectionListLayout>
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
                                <PermissionGuard
                                    requiredPermissions={[
                                        Permission.Authenticated,
                                        Permission.CreateCollection,
                                    ]}
                                >
                                    <Button asChild>
                                        <Link to={'/dashboard/collections/new'}>
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Create Collection
                                        </Link>
                                    </Button>
                                </PermissionGuard>
                            }
                        />
                    ) : null
                }
            />
        </React.Fragment>
    );
}
