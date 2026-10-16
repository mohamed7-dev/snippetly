import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { CollectionListLayout } from '@/components/shared/collection-list-layout';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { discoverCollectionsQueryOptions } from '@/features/discover/lib/discover-query-options';
import { collectionListDto } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { listCurrentUserCollectionsQueryOptions } from '../../lib/collection-listing-query-options';

export function DiscoverCollectionsList() {
    const qClient = useQueryClient();
    const { collections: collectionsSearch } =
        useSearch({
            from: '/(public)/discover/',
        }) ?? {};
    const { sort, filter, filterOperator, tags } = collectionsSearch ?? {};
    const queryKeys = [sort, filter, filterOperator, tags];
    const navigate = useNavigate();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        discoverCollectionsQueryOptions({ sort, filter, filterOperator, tags }, queryKeys),
    );

    const collections = data.pages?.flatMap(p => p.items) ?? [];
    const availableTags = [
        ...new Set(collections.flatMap(collection => collection.tags ?? []).map(tag => tag.value)),
    ];

    const onMutateSuccess = () => {
        qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
    };

    return (
        <React.Fragment>
            <div className="flex items-center gap-3">
                <FilterQueryDialog
                    schema={collectionListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({
                                ...prev,
                                collections: { ...prev?.collections, ...val },
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
                            search: prev => ({
                                ...prev,
                                collections: { ...prev?.collections, sort: val.sort },
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
            <CollectionListLayout>
                {collections.map(collection => (
                    <CollectionCard
                        key={collection.id}
                        collection={collection}
                        forkCollection={{ onSuccess: onMutateSuccess }}
                        addCollectionToFavourites={{
                            onSuccess: () => {
                                // update discover collections query cache manually
                                // to reflect state optimistically, set {isFavouritedByCurrentUser: true}
                            },
                            onError: () => {
                                // update discover collections query cache manually
                                // to reflect state optimistically, set {isFavouritedByCurrentUser: false}
                            },
                        }}
                        removeCollectionFromFavourites={{
                            onSuccess: () => {
                                // update discover collections query cache manually
                                // to reflect state optimistically, set {isFavouritedByCurrentUser: false}
                            },
                            onError: () => {
                                // update discover collections query cache manually
                                // to reflect state optimistically, set {isFavouritedByCurrentUser: true}
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
