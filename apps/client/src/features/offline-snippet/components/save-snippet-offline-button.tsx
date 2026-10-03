import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EyeIcon } from 'lucide-react';
import type React from 'react';
import { useOfflineSnippetStore } from '../hooks/useOfflineSnippetStore';
import type { InsertOfflineSnippetInput } from '../lib/store';

interface SaveSnippetOfflineButtonProps extends React.ComponentProps<typeof Button> {
    label?: string;
    snippet: InsertOfflineSnippetInput;
}

export function SaveSnippetOfflineButton({
    label = 'save snippet offline',
    className,
    onClick,
    snippet,
    ...props
}: SaveSnippetOfflineButtonProps) {
    const {
        insert: { mutate, isPending },
    } = useOfflineSnippetStore();

    const handleOfflineSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented) {
            await mutate(snippet);
        }
    };

    return (
        <LoadingButton
            variant={'ghost'}
            size={'sm'}
            {...props}
            className={cn('w-full', className)}
            onClick={handleOfflineSave}
            isLoading={isPending}
        >
            <EyeIcon className="mr-2 h-4 w-4 rotate-180" />
            {label}
        </LoadingButton>
    );
}
