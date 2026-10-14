import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { cn } from '@/lib/utils';
import { Trash2Icon } from 'lucide-react';
import type React from 'react';
import {
    useSoftDeleteSnippet,
    type SoftDeleteSnippetAsyncActionCallbacks,
} from '../hooks/use-soft-delete-snippet';

interface MoveSnippetToTrashButtonProps extends React.ComponentProps<typeof Button> {
    label?: string;
    snippetId: string;
    mutationCallbacks?: SoftDeleteSnippetAsyncActionCallbacks;
}

export function MoveSnippetToTrashButton({
    className,
    label = 'move snippet to trash',
    snippetId,
    onClick,
    mutationCallbacks,
    ...props
}: MoveSnippetToTrashButtonProps) {
    const { confirm, resetAndClose } = useDeleteConfirmation();
    const { mutateAsync, isPending } = useSoftDeleteSnippet({
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
                title: 'Move Snippet To Trash',
                description: 'Move snippet to trash so that you can restore it later if you want.',
                actionButtonLabel: 'Move To Trash',
                isPending: isPending,
                onConfirm: async () => await mutateAsync({ id: snippetId }),
            });
        }
    };
    return (
        <LoadingButton
            {...props}
            className={cn('w-full', className)}
            onClick={handleDelete}
            isLoading={isPending}
        >
            <Trash2Icon className="mr-2 h-4 w-4" />
            {label}
        </LoadingButton>
    );
}
