import { GoToButton } from '@/components/inputs/goto-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { getCollectionQueryOptions } from '../../lib/query-options';

export function CollectionPageHeader() {
    const { id } = useParams({ from: '/(protected)/dashboard/collections/$id/' });
    const { data } = useQuery(getCollectionQueryOptions(id));
    return (
        <React.Fragment>
            <HeaderWrapper className="flex items-center justify-between flex-wrap">
                <GoToButton label="Back to Collections" to="/dashboard/collections" />

                <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}>
                    <Button asChild>
                        <Link
                            to={'/dashboard/snippets/new'}
                            search={{ collectionId: id, collectionName: data?.name }}
                        >
                            <PlusIcon />
                            Add Snippet
                        </Link>
                    </Button>
                </PermissionGuard>
            </HeaderWrapper>
        </React.Fragment>
    );
}
