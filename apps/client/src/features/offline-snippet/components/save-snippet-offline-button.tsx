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

export function SaveSnippetOfflineButton({
    label = 'save snippet offline',
    onClick,
    snippet,
    onSuccess,
    ...props
}: SaveSnippetOfflineButtonProps) {
    const {
        insert: { mutate, isPending },
    } = useOfflineSnippetStore();

    const handleOfflineSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            if (await mutate(snippet)) onSuccess?.();
        }
    };

    return (
        <LoadingButton {...props} onClick={handleOfflineSave} isLoading={isPending}>
            <LibraryIcon className="rotate-180" />
            {label}
        </LoadingButton>
    );
}
