import { LoadingButton } from '@/components/inputs/loading-button';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { Trash2Icon } from 'lucide-react';
import type React from 'react';
import { useDeleteCollection, type DeleteCollectionMutationCallbacks } from '../hooks/use-delete-collection';

interface DeleteCollectionButtonProps extends Omit<React.ComponentProps<typeof LoadingButton>, 'isLoading'> {
    label?: string;
    collectionId: string;
    mutationCallbacks?: DeleteCollectionMutationCallbacks;
}

export function DeleteCollectionButton({
    className,
    label = 'delete collection',
    collectionId,
    onClick,
    mutationCallbacks,
    ...props
}: DeleteCollectionButtonProps) {
    const navigate = useNavigate();
    const { confirm, resetAndClose } = useDeleteConfirmation();
    const { mutateAsync, isPending } = useDeleteCollection({
        ...mutationCallbacks,
        onSuccess: (...props) => {
            resetAndClose?.();
            navigate({ to: '/dashboard/collections' });
            mutationCallbacks?.onSuccess?.(...props);
        },
    });

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            confirm({
                title: 'Delete collection',
                description: `Are you sure you want delete collection, this action can't be undone.`,
                isPending: isPending,
                onConfirm: async () => await mutateAsync({ id: collectionId }),
            });
        }
    };
    return (
        <LoadingButton {...props} className={cn(className)} onClick={handleDelete} isLoading={isPending}>
            <Trash2Icon className="mr-2 h-4 w-4" />
            {label}
        </LoadingButton>
    );
}
