import { LoadingButton } from '@/components/inputs/loading-button';
import { cn } from '@/lib/utils';
import { GitForkIcon } from 'lucide-react';
import type React from 'react';
import { useForkSnippet, type ForkSnippetMutationCallbacks } from '../hooks/use-fork-snippet';

interface ForkSnippetButtonProps extends Omit<React.ComponentProps<typeof LoadingButton>, 'isLoading'> {
    label?: string;
    mutationCallbacks?: ForkSnippetMutationCallbacks;
    snippetId: string;
    isLoading?: boolean;
}

export function ForkSnippetButton({
    className,
    label = 'fork snippet',
    mutationCallbacks,
    onClick,
    snippetId,
    isLoading,
    ...props
}: ForkSnippetButtonProps) {
    const { mutateAsync, isPending } = useForkSnippet({
        ...mutationCallbacks,
    });

    const handleForking = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented) {
            await mutateAsync({ id: snippetId });
        }
    };
    return (
        <LoadingButton
            variant={'ghost'}
            size={'sm'}
            {...props}
            className={cn('w-full', className)}
            onClick={handleForking}
            isLoading={isPending || isLoading !== undefined ? !!isLoading : isPending}
        >
            <GitForkIcon className="mr-2 h-4 w-4" />
            {label}
        </LoadingButton>
    );
}
