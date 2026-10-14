import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { DeleteCollectionButton } from '@/features/collection-delete/components/delete-collection-button';
import { MoveCollectionToTrashButton } from '@/features/collection-delete/components/move-collection-to-trash-button';
import type { DeleteCollectionMutationCallbacks } from '@/features/collection-delete/hooks/use-delete-collection';
import type { SoftDeleteCollectionMutationCallbacks } from '@/features/collection-delete/hooks/use-soft-delete-collection';
import { ForkCollectionButton } from '@/features/collection-fork/components/fork-collection-button';
import type { ForkCollectionMutationCallbacks } from '@/features/collection-fork/hooks/use-fork-collection';
import type { ApiSuccess } from '@/lib/api-client';
import { Permission, type CollectionListDtoType } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { EditIcon, EyeIcon, MoreHorizontalIcon } from 'lucide-react';
import React from 'react';

export type CollectionActionMenuProps = {
    collection: Omit<ApiSuccess<CollectionListDtoType['output']>['items'][number], 'snippets'>;
    deleteCollection?: DeleteCollectionMutationCallbacks;
    moveCollectionToTrash?: SoftDeleteCollectionMutationCallbacks;
    forkCollection?: ForkCollectionMutationCallbacks;
};
export function CollectionActionMenu({
    collection,
    deleteCollection,
    moveCollectionToTrash,
    forkCollection,
}: CollectionActionMenuProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Button variant={'ghost'} className="justify-start" asChild>
                            <Link to={'/dashboard/collections/$id'} params={{ id: collection.id }}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Collection
                            </Link>
                        </Button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.Owner,
                            Permission.DeleteCollection,
                        ]}
                        ownerId={collection.creator.id}
                    >
                        <DropdownMenuItem asChild>
                            <Button variant={'ghost'} className="justify-start" asChild>
                                <Link to={'/dashboard/collections/$id/edit'} params={{ id: collection.id }}>
                                    <EditIcon className="mr-2 h-4 w-4" />
                                    Edit Collection
                                </Link>
                            </Button>
                        </DropdownMenuItem>
                    </PermissionGuard>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateCollection]}
                    >
                        <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                            <ForkCollectionButton
                                variant={'ghost'}
                                collectionId={collection.id}
                                mutationCallbacks={{
                                    ...forkCollection,
                                    onSuccess: (...props) => {
                                        setOpen(false);
                                        forkCollection?.onSuccess?.(...props);
                                    },
                                }}
                                className="justify-start"
                            />
                        </DropdownMenuItem>
                    </PermissionGuard>
                    <DropdownMenuSeparator />
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.Owner,
                            Permission.DeleteCollection,
                        ]}
                        ownerId={collection.creator.id}
                    >
                        <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                            <MoveCollectionToTrashButton
                                collectionId={collection.id}
                                mutationCallbacks={{
                                    ...moveCollectionToTrash,
                                    onSuccess: (...props) => {
                                        setOpen(false);
                                        moveCollectionToTrash?.onSuccess?.(...props);
                                    },
                                }}
                                className="justify-start"
                                variant={'ghost'}
                            />
                        </DropdownMenuItem>
                    </PermissionGuard>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.Owner,
                            Permission.DeleteCollection,
                        ]}
                        ownerId={collection.creator.id}
                    >
                        <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                            <DeleteCollectionButton
                                collectionId={collection.id}
                                mutationCallbacks={{
                                    ...deleteCollection,
                                    onSuccess: (...props) => {
                                        setOpen(false);
                                        deleteCollection?.onSuccess?.(...props);
                                    },
                                }}
                                className="justify-start w-full"
                                variant={'ghost'}
                            />
                        </DropdownMenuItem>
                    </PermissionGuard>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
