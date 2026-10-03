import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { cn } from '@/lib/utils';
import { Trash2Icon } from 'lucide-react';
import type React from 'react';
import { useDeleteSnippet, type DeleteSnippetAsyncActionCallbacks } from '../hooks/use-delete-snippet';

interface DeleteSnippetButtonProps extends React.ComponentProps<typeof Button> {
    label?: string;
    snippetId: string;
    mutationCallbacks?: DeleteSnippetAsyncActionCallbacks;
}

export function DeleteSnippetButton({
    className,
    label = 'delete snippet',
    snippetId,
    onClick,
    mutationCallbacks,
    ...props
}: DeleteSnippetButtonProps) {
    const { confirm, resetAndClose } = useDeleteConfirmation();
    const { mutateAsync, isPending } = useDeleteSnippet({
        ...mutationCallbacks,
        onSuccess: (...props) => {
            resetAndClose?.();
            mutationCallbacks?.onSuccess?.(...props);
        },
    });

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented) {
            confirm({
                title: 'Delete snippet',
                isPending: isPending,
                onConfirm: async () => await mutateAsync({ id: snippetId }),
            });
        }
    };
    return (
        <LoadingButton
            {...props}
            className={cn('text-destructive focus:text-destructive', className)}
            onClick={handleDelete}
            isLoading={isPending}
        >
            <Trash2Icon className="mr-2 h-4 w-4" />
            {label}
        </LoadingButton>
    );
}
