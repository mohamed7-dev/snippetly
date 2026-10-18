import { GoToButton } from '@/components/inputs/goto-button';
import { LoadingButton } from '@/components/inputs/loading-button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { useSearch } from '@tanstack/react-router';
import { SaveIcon } from 'lucide-react';

export function CreateSnippetPageHeader({ isPending: isMutating }: { isPending: boolean }) {
    const isPending = isMutating;
    const { redirect } = useSearch({ from: '/(protected)/dashboard/snippets/new/' });

    return (
        <HeaderWrapper className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <GoToButton
                    to={redirect ?? '/dashboard/snippets'}
                    label={!redirect ? 'Back to Snippets' : 'Go Back'}
                />
                <h1 className="font-heading font-semibold text-lg">Create New Snippet</h1>
            </div>

            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                isAvailableOffline
            >
                <LoadingButton isLoading={isPending} type="submit">
                    <SaveIcon />
                    Create Snippet
                </LoadingButton>
            </PermissionGuard>
        </HeaderWrapper>
    );
}
