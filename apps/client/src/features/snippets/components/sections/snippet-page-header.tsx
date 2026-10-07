import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { RemoveSnippetOfflineButton } from '@/features/offline-snippet/components/remove-snippet-offline-button';
import { SaveSnippetOfflineButton } from '@/features/offline-snippet/components/save-snippet-offline-button';
import { useOfflineSnippetStore } from '@/features/offline-snippet/hooks/use-offline-snippet-store';
import type { OfflineSnippetItem } from '@/features/offline-snippet/lib/store';
import { Permission } from '@snippetly/common/dto';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeftIcon, EditIcon } from 'lucide-react';
import React from 'react';
import { getSnippetQueryOptions } from '../../lib/snippet-query-options';
import { CopyButton } from '../shared/copy-button';

export function SnippetPageHeader() {
    const {
        getOne: { query },
    } = useOfflineSnippetStore();

    const [offlineSnippet, setOfflineSnippet] = React.useState<OfflineSnippetItem>();
    const [showSaveButton, setShowSaveButton] = React.useState(() => (offlineSnippet ? false : true));

    const params = useParams({ from: '/(protected)/dashboard/snippets/$id/' });
    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(params.id));

    React.useEffect(() => {
        const get = async () => {
            const item = await query({ id: params.id });
            setOfflineSnippet(item);
            if (item) setShowSaveButton(false);
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
                {showSaveButton ? (
                    <SaveSnippetOfflineButton
                        className="w-auto"
                        variant={'outline'}
                        snippet={snippet}
                        onSuccess={() => setShowSaveButton(false)}
                    />
                ) : (
                    <RemoveSnippetOfflineButton
                        className="w-auto"
                        variant={'destructive-outline'}
                        snippet={snippet}
                        onSuccess={() => setShowSaveButton(true)}
                    />
                )}
                <PermissionGuard
                    requiredPermissions={[
                        Permission.Authenticated,
                        Permission.Owner,
                        Permission.UpdateSnippet,
                    ]}
                    ownerId={snippet.creator.id}
                >
                    <Button size="sm" asChild>
                        <Link to={'/dashboard/snippets/$id/edit'} params={{ id: params.id }}>
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                </PermissionGuard>
            </div>
        </HeaderWrapper>
    );
}
