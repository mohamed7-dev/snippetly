import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { CollectionListLayout } from '@/components/shared/collection-list-layout';
import { CreateCollectionIcon } from '@/components/shared/creation-icons';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import {
    listCreatorCollectionsQueryOption,
    listCurrentUserCollectionsQueryOptions,
} from '@/features/collection-listing/lib/collection-listing-query-options';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { OnlineGuard } from '@/features/offline-snippet/components/shared/online-guard';
import type { ApiSuccess } from '@/lib/api-client';
import { collectionListDto, Permission, type CollectionListDtoType } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router';

export function PublicProfilePageCollectionsList() {
    const qClient = useQueryClient();

    const { id } = useParams({ from: '/(public)/developers/$id/' });
    const { collections: collectionsSearch } = useSearch({ from: '/(public)/developers/$id/' }) ?? {};
    const { sort, filter, filterOperator, tags } = collectionsSearch ?? {};
    const queryKeys = [sort, filter, filterOperator, tags];

    const navigate = useNavigate();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        listCreatorCollectionsQueryOption(id, { sort, filter, filterOperator, tags }, queryKeys),
    );
    const collections = data.pages.flatMap(p => p?.items) ?? [];
    const availableTags = [
        ...new Set(collections.flatMap(collection => collection.tags ?? []).map(tag => tag.value)),
    ];

    const onMutateSuccess = () => {
        qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
    };

    const onFavRes = (collectionId: string, action: 'add' | 'remove', branch: 'success' | 'error') => {
        qClient.setQueryData<InfiniteData<ApiSuccess<CollectionListDtoType['output']>>>(
            listCreatorCollectionsQueryOption(id).queryKey,
            old => {
                if (!old) return;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        items: page.items.map(item => {
                            if (item.id === collectionId) {
                                return {
                                    ...item,
                                    relationshipsWithCurrentUser: {
                                        ...item.relationshipsWithCurrentUser,
                                        isFavouritedByCurrentUser:
                                            action === 'add'
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
        <div className="space-y-6">
            <OnlineGuard>
                <div className="flex items-center flex-wrap gap-2">
                    <FilterQueryDialog
                        schema={collectionListDto.input.shape.filter}
                        value={{ filter, filterOperator }}
                        onApply={val =>
                            navigate({
                                to: '.',
                                search: previous => ({
                                    ...previous,
                                    collections: { ...previous?.collections, ...val },
                                }),
                            })
                        }
                    />
                    <SortQueryDialog
                        sortSchema={collectionListDto.input.shape.sort}
                        value={{ sort }}
                        onApply={val =>
                            navigate({
                                to: '.',
                                search: previous => ({
                                    ...previous,
                                    collections: { ...previous?.collections, sort: val.sort },
                                }),
                            })
                        }
                    />
                    <TagFilterBar
                        tags={availableTags}
                        selectedTags={tags?.values ?? []}
                        operator={tags?.operator}
                        onChange={(values, operator) =>
                            navigate({
                                to: '.',
                                search: previous => ({
                                    ...previous,
                                    collections: {
                                        ...previous?.collections,
                                        tags: values.length ? { values, operator } : undefined,
                                    },
                                }),
                            })
                        }
                    />
                </div>
            </OnlineGuard>
            <CollectionListLayout>
                {collections.map(collection => (
                    <CollectionCard
                        key={collection.id}
                        collection={collection}
                        forkCollection={{ onSuccess: onMutateSuccess }}
                        deleteCollection={{ onSuccess: onMutateSuccess }}
                        moveCollectionToTrash={{ onSuccess: onMutateSuccess }}
                        addCollectionToFavourites={{
                            onSuccess: () => {
                                onFavRes(collection.id, 'add', 'success');
                            },
                            onError: () => {
                                onFavRes(collection.id, 'add', 'error');
                            },
                        }}
                        removeCollectionFromFavourites={{
                            onSuccess: () => {
                                onFavRes(collection.id, 'remove', 'success');
                            },
                            onError: () => {
                                onFavRes(collection.id, 'remove', 'error');
                            },
                        }}
                    />
                ))}
            </CollectionListLayout>
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
                                <PermissionGuard
                                    requiredPermissions={[
                                        Permission.Authenticated,
                                        Permission.CreateCollection,
                                    ]}
                                >
                                    <Button asChild>
                                        <Link to="/dashboard/collections/new">
                                            <CreateCollectionIcon className="mr-2 size-4" />
                                            <span>Create Collection</span>
                                        </Link>
                                    </Button>
                                </PermissionGuard>
                            }
                        />
                    ) : null
                }
            />
        </div>
    );
}
