import { LoadingButton } from '@/components/inputs/loading-button';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { cn } from '@/lib/utils';
import { Trash2Icon } from 'lucide-react';
import type React from 'react';
import { useDeleteCollection } from '../hooks/use-delete-collection';
import { type SoftDeleteCollectionMutationCallbacks } from '../hooks/use-soft-delete-collection';

interface MoveCollectionToTrashButtonProps extends Omit<
    React.ComponentProps<typeof LoadingButton>,
    'isLoading'
> {
    label?: string;
    collectionId: string;
    mutationCallbacks?: SoftDeleteCollectionMutationCallbacks;
}

export function DeleteCollectionButton({
    className,
    label = 'delete collection',
    collectionId,
    onClick,
    mutationCallbacks,
    ...props
}: MoveCollectionToTrashButtonProps) {
    const { confirm, resetAndClose } = useDeleteConfirmation();
    const { mutateAsync, isPending } = useDeleteCollection({
        ...mutationCallbacks,
        onSuccess: (...props) => {
            resetAndClose?.();
            mutationCallbacks?.onSuccess?.(...props);
        },
    });

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            confirm({
                title: 'Delete Collection',
                description: "Are you sure you want to delete this collection? this action can't be undone.",
                isPending: isPending,
                onConfirm: async () => await mutateAsync({ id: collectionId }),
            });
        }
    };
    return (
        <LoadingButton {...props} className={cn(className)} onClick={handleDelete} isLoading={isPending}>
            <Trash2Icon />
            {label}
        </LoadingButton>
    );
}
