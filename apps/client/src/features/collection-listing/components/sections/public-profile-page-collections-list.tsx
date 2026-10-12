import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { CollectionListLayout } from '@/components/shared/collection-list-layout';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCreatorCollectionsQueryOption } from '@/features/collection-listing/lib/collection-listing-query-options';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { collectionListDto, Permission } from '@snippetly/common/dto';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';

export function PublicProfilePageCollectionsList() {
    const { id } = useParams({ from: '/(public)/profile/$id' });
    const { collections: collectionsSearch } = useSearch({ from: '/(public)/profile/$id' });
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

    return (
        <React.Fragment>
            <div className="flex items-center gap-2">
                <FilterQueryDialog
                    schema={collectionListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: previous => ({
                                ...previous,
                                collections: { ...previous.collections, filter: val },
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
                                collections: { ...previous.collections, sort: val.sort },
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
                                    ...previous.collections,
                                    tags: values.length ? { values, operator } : undefined,
                                },
                            }),
                        })
                    }
                />
            </div>
            <CollectionListLayout>
                {collections.map(collection => (
                    <CollectionCard key={collection.id} collection={collection} />
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
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            <span>Create Collection</span>
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
