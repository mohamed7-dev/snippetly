import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useOfflineSnippetStore } from '@/features/offline-snippet/hooks/useOfflineSnippetStore';
import type { OfflineSnippetItem } from '@/features/offline-snippet/lib/store';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeftIcon, EditIcon, LibraryIcon } from 'lucide-react';
import React from 'react';
import { getSnippetQueryOptions } from '../../lib/snippet-query-options';
import { CopyButton } from '../shared/copy-button';

export function SnippetPageHeader() {
    const {
        getOne: { query, isPending },
        insert: { mutate, isPending: isSavingOffline },
    } = useOfflineSnippetStore();

    const [offlineSnippet, setOfflineSnippet] = React.useState<OfflineSnippetItem>();
    const [showSaveButton, setShowSaveButton] = React.useState(() => (offlineSnippet ? false : true));

    const params = useParams({ from: '/(protected)/dashboard/snippets/$id/' });
    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(params.id));
    const { user } = useAuth();

    const handleSaveOffline = React.useCallback(async () => {
        await mutate({
            ...snippet,
        });
        setShowSaveButton(false);
    }, [snippet]);

    React.useEffect(() => {
        const get = async () => {
            const item = await query({ id: params.id });
            setOfflineSnippet(item);
        };
        get();
    }, []);

    return (
        <HeaderWrapper className="justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-center gap-3">
                <CopyButton variant={'outline'} code={snippet.code} />
                {showSaveButton && (
                    <Button
                        disabled={isSavingOffline || isPending}
                        variant={'outline'}
                        onClick={handleSaveOffline}
                    >
                        <LibraryIcon className="h-4 w-4 mr-2" />
                        Save For Offline
                    </Button>
                )}
                {snippet.creator.id === user?.id && (
                    <Button size="sm" asChild>
                        <Link to={'/dashboard/snippets/$id/edit'} params={{ id: params.id }}>
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                )}
            </div>
        </HeaderWrapper>
    );
}
