import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

export function CreateSnippetPageHeader({ isPending: isMutating }: { isPending: boolean }) {
    const isPending = isMutating;

    return (
        <HeaderWrapper className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" type="button" asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="font-heading font-semibold text-lg">Create New Snippet</h1>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-center gap-3">
                <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}>
                    <LoadingButton isLoading={isPending} type="submit">
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Create Snippet
                    </LoadingButton>
                </PermissionGuard>
            </div>
        </HeaderWrapper>
    );
}
