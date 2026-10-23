import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { useDeleteCollection } from '@/features/collection-delete/hooks/use-delete-collection';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { TrashSection, type TrashItem } from '@/features/trash/components/shared/trash-section';
import { listTrashedCollectionsQueryOptions } from '@/features/trash/lib/trash-query-options';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { currentUserTrashedCollectionListDto } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useRestoreCollection } from '../hooks/use-restore-collection';

export function TrashCollectionList() {
    const search = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/trash/',
    });
    const { sort, filter, filterOperator, tags } = search?.collections ?? {};
    const queryKeys = [sort, filter, filterOperator, tags];
    const navigate = useNavigate();

    const qClient = useQueryClient();

    const collectionsQuery = useSuspenseInfiniteQuery(
        listTrashedCollectionsQueryOptions({ sort, filter, filterOperator, tags }, queryKeys),
    );
    const collections =
        collectionsQuery.data?.pages.flatMap(page =>
            page.items.map(item => ({
                id: item.id,
                resource: 'collection' as const,
                name: item.name,
                details: `${item.snippetsCount} snippet${item.snippetsCount === 1 ? '' : 's'}`,
                deletedAt: item.deletedAt,
                tags: item.tags,
            })),
        ) ?? [];

    const availableTags = [
        ...new Set(collections.flatMap(collection => collection.tags ?? []).map(tag => tag.value)),
    ];

    const restoreMutation = useRestoreCollection({
        onSuccess: () => {
            qClient.invalidateQueries(listTrashedCollectionsQueryOptions(undefined, queryKeys));
            qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
        },
    });

    // Delete
    const { confirm, resetAndClose } = useDeleteConfirmation();

    const deleteMutation = useDeleteCollection({
        onSuccess: () => {
            resetAndClose?.();
            qClient.invalidateQueries(listTrashedCollectionsQueryOptions(undefined, queryKeys));
            qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
        },
    });
    const handleDelete = async (item: TrashItem) => {
        confirm({
            title: 'Delete Collection',
            description: "Are you sure you want to delete this collection? this action can't be undone.",
            isPending: deleteMutation.isPending,
            onConfirm: async () => await deleteMutation.mutateAsync({ id: item.id }),
        });
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FilterQueryDialog
                    schema={currentUserTrashedCollectionListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({
                                ...prev,
                                snippets: { ...prev?.snippets, ...val },
                            }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={currentUserTrashedCollectionListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({
                                ...prev,
                                snippets: { ...prev?.snippets, sort: val.sort },
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
                                snippets: {
                                    ...previous?.snippets,
                                    tags: values.length ? { values, operator } : undefined,
                                },
                            }),
                        })
                    }
                />
            </div>
            <TrashSection
                title="Collections"
                items={collections}
                isLoading={collectionsQuery.isLoading}
                isError={collectionsQuery.isError}
                errorMessage={collectionsQuery.error?.message}
                onRestore={item => restoreMutation.mutateAsync({ id: item.id })}
                onDelete={handleDelete}
                isRestoring={restoreMutation.isPending}
                fetchNextPage={() => void collectionsQuery.fetchNextPage()}
                hasNextPage={collectionsQuery.hasNextPage}
                isFetchingNextPage={collectionsQuery.isFetchingNextPage}
            />
        </div>
    );
}
