import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { CollectionListLayout } from '@/components/shared/collection-list-layout';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { CollectionCard } from '@/features/collections/components/collection-card';
import type { ApiSuccess } from '@/lib/api-client';
import { Permission, type CurrentUserCollectionListDtoType } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { Link, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { listCurrentUserCollectionsQueryOptions } from '../../lib/collection-listing-query-options';

export function CollectionsPageMainContent() {
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/collections/',
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

    const onFavRes = (collectionId: string, favAction: 'add' | 'remove', branch: 'success' | 'error') => {
        qClient.setQueriesData<InfiniteData<ApiSuccess<CurrentUserCollectionListDtoType['output']>>>(
            { queryKey: listCurrentUserCollectionsQueryOptions().queryKey },
            old => {
                if (!old) return;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        items: page.items.map(item => {
                            if (collectionId === item.id) {
                                return {
                                    ...item,
                                    relationshipsWithCurrentUser: {
                                        ...item.relationshipsWithCurrentUser,
                                        isFavouritedByCurrentUser:
                                            favAction === 'add'
                                                ? branch === 'success'
                                                    ? true
                                                    : false
                                                : branch === 'success'
                                                  ? false
                                                  : true,
                                    },
                                };
                            }
                            return item;
                        }),
                    })),
                };
            },
        );
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
                        isAvailableOffline={true}
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
                            addCollectionToFavourites={{
                                onSuccess: () => onFavRes(collection.id, 'add', 'success'),
                                onError: () => onFavRes(collection.id, 'add', 'error'),
                            }}
                            removeCollectionFromFavourites={{
                                onSuccess: () => onFavRes(collection.id, 'remove', 'success'),
                                onError: () => onFavRes(collection.id, 'remove', 'error'),
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
                                    isAvailableOffline={true}
                                >
                                    <Button asChild>
                                        <Link to={'/dashboard/collections/new'}>
                                            <PlusIcon />
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
