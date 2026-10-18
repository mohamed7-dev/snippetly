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
import { AddToFavouritesButton } from '@/features/favourites/components/shared/add-to-favourites-button';
import { RemoveFromFavouritesButton } from '@/features/favourites/components/shared/remove-from-favourites-button';
import type {
    AddToFavouritesMutationCallbacks,
    RemoveFromFavouritesMutationCallbacks,
} from '@/features/favourites/hooks/use-favourite-mutation';
import { favouriteCollectionsQueryOptions } from '@/features/favourites/lib/favourites-query-options';
import { useIsOnline } from '@/features/offline-snippet/hooks/use-is-online';
import { useOfflineEntityAvailability } from '@/features/offline-snippet/hooks/use-offline-entity-availability';
import type { ApiSuccess } from '@/lib/api-client';
import { Permission, type CollectionListDtoType } from '@snippetly/common/dto';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { EditIcon, EyeIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import React from 'react';

export type CollectionActionMenuProps = {
    collection: Omit<ApiSuccess<CollectionListDtoType['output']>['items'][number], 'snippets'>;
    deleteCollection?: DeleteCollectionMutationCallbacks;
    moveCollectionToTrash?: SoftDeleteCollectionMutationCallbacks;
    forkCollection?: ForkCollectionMutationCallbacks;
    addCollectionToFavourites?: AddToFavouritesMutationCallbacks;
    removeCollectionFromFavourites?: RemoveFromFavouritesMutationCallbacks;
    showViewButton?: boolean;
    showEditButton?: boolean;
    showAddSnippetButton?: boolean;
    showDeleteButton?: boolean;
    showMoveToTrashButton?: boolean;
    showForkButton?: boolean;
    showAddToFavButton?: boolean;
    showRemoveFromFavButton?: boolean;
};
export function CollectionActionMenu({
    collection,
    deleteCollection,
    moveCollectionToTrash,
    forkCollection,
    addCollectionToFavourites,
    removeCollectionFromFavourites,
    showViewButton = true,
    showEditButton = true,
    showAddSnippetButton = true,
    showDeleteButton: requestedShowDeleteButton = true,
    showMoveToTrashButton: requestedShowMoveToTrashButton = true,
    showForkButton: requestedShowForkButton = true,
    showAddToFavButton: requestedShowAddToFavButton = true,
    showRemoveFromFavButton: requestedShowRemoveFromFavButton = true,
}: CollectionActionMenuProps) {
    const isOnline = useIsOnline();
    const isCollectionCachedOffline = useOfflineEntityAvailability('collection-details', collection.id);
    const [open, setOpen] = React.useState(false);
    const qClient = useQueryClient();
    const showAddToFavButton = isOnline && requestedShowAddToFavButton;
    const showRemoveFromFavButton = isOnline && requestedShowRemoveFromFavButton;
    const showDeleteButton = isOnline && requestedShowDeleteButton;
    const showMoveToTrashButton = isOnline && requestedShowMoveToTrashButton;
    const showForkButton = isOnline && requestedShowForkButton && collection.allowForking;
    const canEditCollection = showEditButton && (isOnline || isCollectionCachedOffline);
    const showManageActions =
        showAddSnippetButton ||
        canEditCollection ||
        showForkButton ||
        showMoveToTrashButton ||
        showDeleteButton;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                    <MoreHorizontalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {(showViewButton || showAddToFavButton || showRemoveFromFavButton) && (
                    <DropdownMenuGroup>
                        {showViewButton && (
                            <DropdownMenuItem asChild>
                                <Button variant={'ghost'} className="w-full justify-start" asChild>
                                    <Link to={'/collections/$id'} params={{ id: collection.id }}>
                                        <EyeIcon />
                                        View Collection
                                    </Link>
                                </Button>
                            </DropdownMenuItem>
                        )}

                        {(showRemoveFromFavButton || showAddToFavButton) && (
                            <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                                <DropdownMenuItem asChild>
                                    {showRemoveFromFavButton && collection.isFavouritedByCurrentUser ? (
                                        <RemoveFromFavouritesButton
                                            resourceType="collections"
                                            resourceId={collection.id}
                                            variant="ghost"
                                            type="button"
                                            className="w-full justify-start"
                                            mutationCallbacks={{
                                                ...removeCollectionFromFavourites,
                                                onSuccess: (...props) => {
                                                    setOpen(false);
                                                    qClient.invalidateQueries(
                                                        favouriteCollectionsQueryOptions(),
                                                    );
                                                    removeCollectionFromFavourites?.onSuccess?.(...props);
                                                },
                                            }}
                                        />
                                    ) : (
                                        <React.Fragment>
                                            {showAddToFavButton && (
                                                <AddToFavouritesButton
                                                    resourceType="collections"
                                                    resourceId={collection.id}
                                                    variant="ghost"
                                                    type="button"
                                                    className="w-full justify-start"
                                                    mutationCallbacks={{
                                                        ...addCollectionToFavourites,
                                                        onSuccess: (...props) => {
                                                            setOpen(false);
                                                            qClient.invalidateQueries(
                                                                favouriteCollectionsQueryOptions(),
                                                            );
                                                            addCollectionToFavourites?.onSuccess?.(...props);
                                                        },
                                                    }}
                                                />
                                            )}
                                        </React.Fragment>
                                    )}
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                        {showManageActions && <DropdownMenuSeparator />}
                    </DropdownMenuGroup>
                )}

                {showManageActions && (
                    <DropdownMenuGroup>
                        {showAddSnippetButton && (
                            <PermissionGuard
                                requiredPermissions={[
                                    Permission.Authenticated,
                                    Permission.Owner,
                                    Permission.CreateSnippet,
                                ]}
                                ownerId={collection.creator.id}
                                isAvailableOffline={true}
                            >
                                <DropdownMenuItem asChild>
                                    <Button variant={'ghost'} className="w-full justify-start" asChild>
                                        <Link
                                            to={'/dashboard/snippets/new'}
                                            search={{
                                                collectionId: collection.id,
                                                collectionName: collection.name,
                                            }}
                                        >
                                            <PlusIcon />
                                            Add New Snippet To Collection
                                        </Link>
                                    </Button>
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                        {canEditCollection && (
                            <PermissionGuard
                                requiredPermissions={[
                                    Permission.Authenticated,
                                    Permission.Owner,
                                    Permission.UpdateCollection,
                                ]}
                                ownerId={collection.creator.id}
                                isAvailableOffline={!isOnline && isCollectionCachedOffline}
                            >
                                <DropdownMenuItem asChild>
                                    <Button variant={'ghost'} className="w-full justify-start" asChild>
                                        <Link
                                            to={'/dashboard/collections/$id/edit'}
                                            params={{ id: collection.id }}
                                        >
                                            <EditIcon />
                                            Edit Collection
                                        </Link>
                                    </Button>
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                        {showForkButton && (
                            <PermissionGuard
                                requiredPermissions={[Permission.Authenticated, Permission.CreateCollection]}
                                ownerId={collection.creator.id}
                                preventOwner={true}
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
                                        className="w-full justify-start"
                                    />
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}

                        <PermissionGuard
                            requiredPermissions={[
                                Permission.Authenticated,
                                Permission.Owner,
                                Permission.DeleteCollection,
                            ]}
                            ownerId={collection.creator.id}
                        >
                            {showMoveToTrashButton && (
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
                                        className="w-full justify-start"
                                        variant={'ghost'}
                                    />
                                </DropdownMenuItem>
                            )}
                            {showDeleteButton && (
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
                            )}
                        </PermissionGuard>
                    </DropdownMenuGroup>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
