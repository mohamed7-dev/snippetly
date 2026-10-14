import { LoadingButton } from '@/components/inputs/loading-button';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { cn } from '@/lib/utils';
import { Trash2Icon } from 'lucide-react';
import type React from 'react';
import {
    useSoftDeleteCollection,
    type SoftDeleteCollectionMutationCallbacks,
} from '../hooks/use-soft-delete-collection';

interface MoveCollectionToTrashButtonProps extends Omit<
    React.ComponentProps<typeof LoadingButton>,
    'isLoading'
> {
    label?: string;
    collectionId: string;
    mutationCallbacks?: SoftDeleteCollectionMutationCallbacks;
}

export function MoveCollectionToTrashButton({
    className,
    label = 'move collection to trash',
    collectionId,
    onClick,
    mutationCallbacks,
    ...props
}: MoveCollectionToTrashButtonProps) {
    const { confirm, resetAndClose } = useDeleteConfirmation();
    const { mutateAsync, isPending } = useSoftDeleteCollection({
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
                title: 'Move Collection To Trash',
                description: `Move collection to trash so that you can restore it if you want.`,
                actionButtonLabel: 'Move To Trash',
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
