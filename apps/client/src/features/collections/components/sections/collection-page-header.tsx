import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import React from 'react';

export function CollectionPageHeader() {
    return (
        <React.Fragment>
            <HeaderWrapper className="flex items-center justify-between flex-wrap">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to={'/dashboard/collections'} className="flex items-center gap-2">
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Collections
                        </Link>
                    </Button>
                </div>

                <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}>
                    <Button asChild>
                        <Link to={'/dashboard/snippets/new'}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Snippet
                        </Link>
                    </Button>
                </PermissionGuard>
            </HeaderWrapper>
        </React.Fragment>
    );
}
