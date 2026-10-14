import { GoToButton } from '@/components/inputs/goto-button';
import { LoadingButton } from '@/components/inputs/loading-button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { useSearch } from '@tanstack/react-router';
import { SaveIcon } from 'lucide-react';

export function CreateCollectionPageHeader({ isPending }: { isPending: boolean }) {
    const { redirect } = useSearch({
        from: '/(protected)/dashboard/collections/new',
    });
    return (
        <HeaderWrapper className="px-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <GoToButton
                    to={redirect ?? '/dashboard/collections'}
                    label={!redirect ? 'Back to Collections' : 'Go Back'}
                />
                <h1 className="font-heading font-semibold text-lg">Create New Collection</h1>
            </div>

            <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.CreateCollection]}>
                <LoadingButton isLoading={isPending} type="submit">
                    <SaveIcon />
                    Create Collection
                </LoadingButton>
            </PermissionGuard>
        </HeaderWrapper>
    );
}
