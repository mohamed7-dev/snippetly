import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { SortQueryDialog } from '@/components/shared/list-query-builder/sort-query-dialog';
import { TagFilterBar } from '@/components/shared/tag-filter-bar';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { useDeleteSnippet } from '@/features/snippet-delete/hooks/use-delete-snippet';
import { TrashSection, type TrashItem } from '@/features/trash/components/shared/trash-section';
import { listTrashedSnippetsQueryOptions } from '@/features/trash/lib/trash-query-options';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { currentUserTrashedSnippetListDto } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useRestoreSnippet } from '../hooks/use-restore-snippet';

export function TrashSnippetsList() {
    const { snippets: snippetsSearch } = useSearch({
        from: '/(protected)/dashboard/_dashboard-layout/_boundary/trash/',
    });
    const { sort, filter, filterOperator, tags } = snippetsSearch ?? {};
    const queryKeys = [sort, filter, filterOperator, tags];
    const navigate = useNavigate();
    const qClient = useQueryClient();

    const snippetsQuery = useSuspenseInfiniteQuery(
        listTrashedSnippetsQueryOptions({ sort, filter, filterOperator, tags }, queryKeys),
    );

    const snippets =
        snippetsQuery.data?.pages.flatMap(page =>
            page.items.map(item => ({
                id: item.id,
                resource: 'snippet' as const,
                name: item.name,
                details: item.language,
                deletedAt: item.deletedAt,
                tags: item.tags,
            })),
        ) ?? [];

    const availableTags = [...new Set(snippets.flatMap(snippet => snippet.tags ?? []).map(tag => tag.value))];

    const restoreMutation = useRestoreSnippet({
        onSuccess: () => {
            qClient.invalidateQueries(listTrashedSnippetsQueryOptions(undefined, queryKeys));
            qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
        },
    });

    // Delete
    const { confirm, resetAndClose } = useDeleteConfirmation();
    const deleteMutation = useDeleteSnippet({
        onSuccess: () => {
            resetAndClose?.();
            qClient.invalidateQueries(listTrashedSnippetsQueryOptions(undefined, queryKeys));
            qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
        },
    });

    const handleDelete = async (item: TrashItem) => {
        confirm({
            title: 'Delete Snippet',
            description: "Are you sure you want to delete this snippet? this action can't be undone.",
            isPending: deleteMutation.isPending,
            onConfirm: async () => await deleteMutation.mutateAsync({ id: item.id }),
        });
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FilterQueryDialog
                    schema={currentUserTrashedSnippetListDto.input.shape.filter}
                    value={{ filter, filterOperator }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({
                                ...prev,
                                snippets: { ...prev.snippets, ...val },
                            }),
                        })
                    }
                />
                <SortQueryDialog
                    sortSchema={currentUserTrashedSnippetListDto.input.shape.sort}
                    value={{ sort }}
                    onApply={val =>
                        navigate({
                            to: '.',
                            search: prev => ({
                                ...prev,
                                snippets: { ...prev.snippets, sort: val.sort },
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
                                    ...previous.snippets,
                                    tags: values.length ? { values, operator } : undefined,
                                },
                            }),
                        })
                    }
                />
            </div>
            <TrashSection
                title="Snippets"
                items={snippets}
                isLoading={snippetsQuery.isLoading}
                isError={snippetsQuery.isError}
                errorMessage={snippetsQuery.error?.message}
                onRestore={item => restoreMutation.mutateAsync({ id: item.id })}
                onDelete={handleDelete}
                isRestoring={restoreMutation.isPending}
                fetchNextPage={() => void snippetsQuery.fetchNextPage()}
                hasNextPage={snippetsQuery.hasNextPage}
                isFetchingNextPage={snippetsQuery.isFetchingNextPage}
            />
        </div>
    );
}
