import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
    className,
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
            await mutate(snippet).then(() => onSuccess?.());
        }
    };

    return (
        <LoadingButton
            {...props}
            className={cn('w-full', className)}
            onClick={handleOfflineRemove}
            isLoading={isPending}
        >
            <LibraryIcon className="mr-2 h-4 w-4 rotate-180" />
            {label}
        </LoadingButton>
    );
}
