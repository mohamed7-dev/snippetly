import { LoadingButton } from '@/components/inputs/loading-button';
import { GitForkIcon } from 'lucide-react';
import type React from 'react';
import { useForkCollection, type ForkCollectionMutationCallbacks } from '../hooks/use-fork-collection';

interface ForkCollectionButtonProps extends Omit<React.ComponentProps<typeof LoadingButton>, 'isLoading'> {
    label?: string;
    mutationCallbacks?: ForkCollectionMutationCallbacks;
    collectionId: string;
}

export function ForkCollectionButton({
    label = 'fork collection',
    mutationCallbacks,
    onClick,
    collectionId,
    ...props
}: ForkCollectionButtonProps) {
    const { mutateAsync, isPending } = useForkCollection({
        ...mutationCallbacks,
        onSuccess: (...props) => {
            mutationCallbacks?.onSuccess?.(...props);
        },
    });

    const handleForking = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            await mutateAsync({ id: collectionId });
        }
    };
    return (
        <LoadingButton {...props} onClick={handleForking} isLoading={isPending}>
            <GitForkIcon />
            {label}
        </LoadingButton>
    );
}
