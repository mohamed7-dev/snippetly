import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { LibraryIcon } from 'lucide-react';
import type React from 'react';
import { useOfflineCollectionStore } from '../hooks/use-offline-collection-store';

interface RemoveCollectionOfflineButtonProps extends React.ComponentProps<typeof Button> {
    collectionId: string;
    label?: string;
    onSuccess?: () => void;
}

export function RemoveCollectionOfflineButton({
    collectionId,
    label = 'remove offline collection',
    onClick,
    onSuccess,
    ...props
}: RemoveCollectionOfflineButtonProps) {
    const {
        remove: { mutate, isPending },
    } = useOfflineCollectionStore();

    const handleOfflineRemove = async (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.isDefaultPrevented() && (await mutate(collectionId))) onSuccess?.();
    };

    return (
        <LoadingButton {...props} onClick={handleOfflineRemove} isLoading={isPending}>
            <LibraryIcon className="rotate-180" />
            {label}
        </LoadingButton>
    );
}
