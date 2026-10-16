import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { LibraryIcon } from 'lucide-react';
import type React from 'react';
import { useOfflineSnippetStore } from '../hooks/use-offline-snippet-store';
import type { InsertOfflineSnippetInput } from '../lib/store';

interface SaveSnippetOfflineButtonProps extends React.ComponentProps<typeof Button> {
    label?: string;
    snippet: InsertOfflineSnippetInput;
    onSuccess?: () => void;
}

export function RemoveSnippetOfflineButton({
    label = 'remove offline snippet',
    onClick,
    snippet,
    onSuccess,
    ...props
}: SaveSnippetOfflineButtonProps) {
    const {
        remove: { mutate, isPending },
    } = useOfflineSnippetStore();

    const handleOfflineRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            if (await mutate(snippet)) onSuccess?.();
        }
    };

    return (
        <LoadingButton {...props} onClick={handleOfflineRemove} isLoading={isPending}>
            <LibraryIcon className="rotate-180" />
            {label}
        </LoadingButton>
    );
}
