import { LoadingButton } from '@/components/inputs/loading-button';
import { cn } from '@/lib/utils';
import { GitForkIcon } from 'lucide-react';
import type React from 'react';
import { toast } from 'sonner';
import { useForkCollection, type ForkCollectionMutationCallbacks } from '../hooks/use-fork-collection';

interface ForkCollectionButtonProps extends Omit<React.ComponentProps<typeof LoadingButton>, 'isLoading'> {
    label?: string;
    mutationCallbacks?: ForkCollectionMutationCallbacks;
    collectionId: string;
}

export function ForkCollectionButton({
    className,
    label = 'fork collection',
    mutationCallbacks,
    onClick,
    collectionId,
    ...props
}: ForkCollectionButtonProps) {
    const { mutateAsync, isPending } = useForkCollection({
        ...mutationCallbacks,
        onSuccess: (...props) => {
            toast.success('Collection was forked successfully');
            mutationCallbacks?.onSuccess?.(...props);
        },
    });

    const handleForking = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented) {
            await mutateAsync({ id: collectionId });
        }
    };
    return (
        <LoadingButton
            {...props}
            className={cn('w-full', className)}
            onClick={handleForking}
            isLoading={isPending}
        >
            <GitForkIcon className="mr-2 h-4 w-4" />
            {label}
        </LoadingButton>
    );
}
