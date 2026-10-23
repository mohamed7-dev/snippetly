import { LoadingButton } from '@/components/inputs/loading-button';
import { FilterQueryDialog } from '@/components/shared/list-query-builder/filter-query-dialog';
import { Button } from '@/components/ui/button';
import { listCollectionSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { FilterGroupOperator, snippetListDto, type SnippetListDtoType } from '@snippetly/common/dto';
import { useQueryClient } from '@tanstack/react-query';
import { LibraryIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useOfflineCollectionStore } from '../hooks/use-offline-collection-store';
import type { InsertOfflineCollectionInput, OfflineSnippetItem } from '../lib/store';

const MAX_OFFLINE_COLLECTION_SNIPPETS = 100;

interface SaveCollectionOfflineButtonProps extends React.ComponentProps<typeof Button> {
    collection: InsertOfflineCollectionInput;
    label?: string;
    onSuccess?: () => void;
}

export function SaveCollectionOfflineButton({
    collection,
    label = 'save collection offline',
    onClick,
    onSuccess,
    ...props
}: SaveCollectionOfflineButtonProps) {
    const queryClient = useQueryClient();
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [isFetchingSnippets, setIsFetchingSnippets] = useState(false);
    const {
        insert: { mutate, isPending },
    } = useOfflineCollectionStore();

    const handleOfflineSave = (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.isDefaultPrevented()) setFilterDialogOpen(true);
    };

    const saveCollection = async ({
        filter,
        filterOperator,
    }: Pick<SnippetListDtoType['input'], 'filter'> & { filterOperator?: FilterGroupOperator }) => {
        setIsFetchingSnippets(true);
        try {
            const query = listCollectionSnippetsQueryOptions(
                collection.id,
                {
                    filter,
                    filterOperator,
                    take: MAX_OFFLINE_COLLECTION_SNIPPETS,
                },
                [
                    'save-offline',
                    JSON.stringify({ filter, filterOperator }),
                    `${MAX_OFFLINE_COLLECTION_SNIPPETS}`,
                ],
            );
            const result = await queryClient.fetchInfiniteQuery(query);
            const savedAt = new Date();
            const snippets: OfflineSnippetItem[] = result.pages[0].items.map(snippet => ({
                ...snippet,
                collection: {
                    id: collection.id,
                    name: collection.name,
                    slug: collection.slug,
                    color: collection.color,
                },
                savedAt,
            }));

            if (await mutate({ ...collection, snippets })) onSuccess?.();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to download collection snippets for offline use',
            );
        } finally {
            setIsFetchingSnippets(false);
        }
    };

    return (
        <>
            <LoadingButton {...props} onClick={handleOfflineSave} isLoading={isPending || isFetchingSnippets}>
                <LibraryIcon className="rotate-180" />
                {label}
            </LoadingButton>
            <FilterQueryDialog
                schema={snippetListDto.input.shape.filter}
                open={filterDialogOpen}
                onOpenChange={setFilterDialogOpen}
                trigger={null}
                title="Choose snippets to save offline"
                description={`Choose filters for the snippets to save. Up to ${MAX_OFFLINE_COLLECTION_SNIPPETS} matching snippets will be stored with this collection.`}
                onApply={value => {
                    void saveCollection({
                        filter: value.filter,
                        filterOperator:
                            value.filterOperator === FilterGroupOperator.OR
                                ? FilterGroupOperator.OR
                                : FilterGroupOperator.AND,
                    });
                }}
            />
        </>
    );
}
