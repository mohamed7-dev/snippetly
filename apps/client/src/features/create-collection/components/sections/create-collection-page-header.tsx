import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { Link, useSearch } from '@tanstack/react-router';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

export function CreateCollectionPageHeader({ isPending }: { isPending: boolean }) {
    const { redirect } = useSearch({
        from: '/(protected)/dashboard/collections/new',
    });
    return (
        <HeaderWrapper className="px-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" size="sm" asChild>
                    <Link to={redirect ?? '/dashboard/collections'} className="flex items-center gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        {!redirect ? 'Back to Collections' : 'Go Back'}
                    </Link>
                </Button>
                <h1 className="font-heading font-semibold text-lg">Create New Collection</h1>
            </div>

            <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.CreateCollection]}>
                <LoadingButton isLoading={isPending} size="sm" type="submit">
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Create Collection
                </LoadingButton>
            </PermissionGuard>
        </HeaderWrapper>
    );
}
