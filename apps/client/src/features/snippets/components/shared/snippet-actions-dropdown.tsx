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
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { AddToFavouritesButton } from '@/features/favourites/components/shared/add-to-favourites-button';
import { RemoveFromFavouritesButton } from '@/features/favourites/components/shared/remove-from-favourites-button';
import type { AddToFavouritesMutationCallbacks } from '@/features/favourites/hooks/use-favourite-mutation';
import { favouriteSnippetsQueryOptions } from '@/features/favourites/lib/favourites-query-options';
import { RemoveSnippetOfflineButton } from '@/features/offline-snippet/components/remove-snippet-offline-button';
import { SaveSnippetOfflineButton } from '@/features/offline-snippet/components/save-snippet-offline-button';
import { useOfflineSnippetStore } from '@/features/offline-snippet/hooks/use-offline-snippet-store';
import { DeleteSnippetButton } from '@/features/snippet-delete/components/delete-snippet-button';
import { MoveSnippetToTrashButton } from '@/features/snippet-delete/components/move-snippet-to-trash-button';
import type { DeleteSnippetAsyncActionCallbacks } from '@/features/snippet-delete/hooks/use-delete-snippet';
import type { SoftDeleteSnippetAsyncActionCallbacks } from '@/features/snippet-delete/hooks/use-soft-delete-snippet';
import { ForkSnippetButton } from '@/features/snippet-fork/components/fork-snippet-button';
import { ForkSnippetToCollection } from '@/features/snippet-fork/components/fork-snippet-to-collection';
import type { ForkSnippetMutationCallbacks } from '@/features/snippet-fork/hooks/use-fork-snippet';
import { type ApiSuccess } from '@/lib/api-client';
import { Permission, type SnippetListDtoType } from '@snippetly/common/dto';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { EditIcon, EyeIcon, MoreHorizontalIcon } from 'lucide-react';
import React from 'react';
import { CopyButton } from './copy-button';

export interface SnippetActionsDropdownProps {
    snippet: ApiSuccess<SnippetListDtoType['output']>['items'][number];
    deleteSnippet?: DeleteSnippetAsyncActionCallbacks;
    moveSnippetToTrash?: SoftDeleteSnippetAsyncActionCallbacks;
    forkSnippet?: ForkSnippetMutationCallbacks;
    addSnippetToFavourites?: AddToFavouritesMutationCallbacks;
    removeSnippetFromFavourites?: AddToFavouritesMutationCallbacks;
    Trigger?: React.ReactNode;
    showViewButton?: boolean;
    showEditButton?: boolean;
    showDeleteButton?: boolean;
    showMoveToTrashButton?: boolean;
    showForkButton?: boolean;
    showForkToCollectionButton?: boolean;
    showOfflineSaveButton?: boolean;
    showOfflineRemoveButton?: boolean;
    showCopyButton?: boolean;
    showAddToFavButton?: boolean;
    showRemoveFromFavButton?: boolean;
}

export function SnippetActionsDropdown({
    snippet,
    deleteSnippet,
    moveSnippetToTrash,
    addSnippetToFavourites,
    removeSnippetFromFavourites,
    forkSnippet,
    Trigger,
    showViewButton = true,
    showEditButton = true,
    showDeleteButton = true,
    showMoveToTrashButton = true,
    showForkButton = true,
    showForkToCollectionButton = true,
    showOfflineSaveButton: explicitlyShowOfflineSaveButton = true,
    showOfflineRemoveButton: explicitlyRemoveOfflineSaveButton = true,
    showCopyButton = true,
    showAddToFavButton = true,
    showRemoveFromFavButton = true,
}: SnippetActionsDropdownProps) {
    const qClient = useQueryClient();
    const [open, setOpen] = React.useState(false);
    const {
        getOne: { query: getOfflineSnippet, isPending },
    } = useOfflineSnippetStore();
    const [showSaveOfflineButton, setShowSaveOfflineButton] = React.useState(() => true);
    const collectionId = 'collection' in snippet ? snippet.collection?.id : undefined;

    React.useEffect(() => {
        const query = async () => {
            const item = await getOfflineSnippet({ id: snippet.id });
            if (item) {
                setShowSaveOfflineButton(false);
            }
        };
        query();
    }, [snippet]);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                {Trigger ? (
                    Trigger
                ) : (
                    <Button variant="ghost">
                        <MoreHorizontalIcon />
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {(showViewButton || showRemoveFromFavButton || showAddToFavButton || showCopyButton) && (
                    <DropdownMenuGroup>
                        {showViewButton && (
                            <DropdownMenuItem asChild>
                                <Button variant={'ghost'} className="w-full justify-start" asChild>
                                    <Link to="/snippets/$id" params={{ id: snippet.id }} preload={false}>
                                        <EyeIcon />
                                        View Details
                                    </Link>
                                </Button>
                            </DropdownMenuItem>
                        )}
                        {/* TODO: use Permission.CreateFavourite when it gets generated  */}

                        <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                            <DropdownMenuItem asChild>
                                {showRemoveFromFavButton && snippet.isFavouritedByCurrentUser ? (
                                    <RemoveFromFavouritesButton
                                        variant="ghost"
                                        className="w-full justify-start"
                                        resourceType="snippets"
                                        resourceId={snippet.id}
                                        mutationCallbacks={{
                                            ...removeSnippetFromFavourites,
                                            onSuccess: (...props) => {
                                                setOpen(false);
                                                qClient.invalidateQueries(favouriteSnippetsQueryOptions());
                                                removeSnippetFromFavourites?.onSuccess?.(...props);
                                            },
                                        }}
                                    />
                                ) : (
                                    <React.Fragment>
                                        {showAddToFavButton && (
                                            <AddToFavouritesButton
                                                variant="ghost"
                                                className="w-full justify-start"
                                                resourceType="snippets"
                                                resourceId={snippet.id}
                                                mutationCallbacks={{
                                                    ...addSnippetToFavourites,
                                                    onSuccess: (...props) => {
                                                        setOpen(false);
                                                        qClient.invalidateQueries(
                                                            favouriteSnippetsQueryOptions(),
                                                        );
                                                        addSnippetToFavourites?.onSuccess?.(...props);
                                                    },
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                )}
                            </DropdownMenuItem>
                        </PermissionGuard>
                        {showCopyButton && (
                            <DropdownMenuItem asChild>
                                <CopyButton
                                    code={snippet.code}
                                    variant={'ghost'}
                                    className="w-full justify-start"
                                />
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                )}
                {showEditButton && (
                    <DropdownMenuGroup>
                        {showEditButton && (
                            <PermissionGuard
                                requiredPermissions={[
                                    Permission.Authenticated,
                                    Permission.Owner,
                                    Permission.UpdateSnippet,
                                ]}
                                ownerId={snippet.creator.id}
                            >
                                <DropdownMenuItem asChild>
                                    <Button variant={'ghost'} className="w-full justify-start" asChild>
                                        <Link
                                            to="/dashboard/snippets/$id/edit"
                                            params={{ id: snippet.id }}
                                            preload={false}
                                        >
                                            <EditIcon />
                                            Edit Snippet
                                        </Link>
                                    </Button>
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}

                        <DropdownMenuSeparator />
                    </DropdownMenuGroup>
                )}
                {(showDeleteButton ||
                    showMoveToTrashButton ||
                    explicitlyShowOfflineSaveButton ||
                    explicitlyRemoveOfflineSaveButton) && (
                    <DropdownMenuGroup>
                        <PermissionGuard
                            requiredPermissions={[
                                Permission.Authenticated,
                                Permission.Owner,
                                Permission.DeleteSnippet,
                            ]}
                            ownerId={snippet.creator.id}
                        >
                            {showMoveToTrashButton && (
                                <DropdownMenuItem asChild>
                                    <MoveSnippetToTrashButton
                                        snippetId={snippet.id}
                                        variant={'ghost'}
                                        className="w-full justify-start"
                                        mutationCallbacks={{
                                            ...moveSnippetToTrash,
                                            onSuccess: (...props) => {
                                                setOpen(false);
                                                moveSnippetToTrash?.onSuccess?.(...props);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            )}
                            {showDeleteButton && (
                                <DropdownMenuItem asChild>
                                    <DeleteSnippetButton
                                        snippetId={snippet.id}
                                        variant={'ghost'}
                                        className="w-full justify-start"
                                        mutationCallbacks={{
                                            ...deleteSnippet,
                                            onSuccess: (...props) => {
                                                setOpen(false);
                                                deleteSnippet?.onSuccess?.(...props);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            )}
                        </PermissionGuard>
                        <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                            {showSaveOfflineButton && explicitlyShowOfflineSaveButton ? (
                                <SaveSnippetOfflineButton
                                    variant={'ghost'}
                                    snippet={snippet}
                                    className="w-full justify-start"
                                    disabled={isPending}
                                    onSuccess={() => setShowSaveOfflineButton(false)}
                                />
                            ) : (
                                <React.Fragment>
                                    {explicitlyRemoveOfflineSaveButton && (
                                        <RemoveSnippetOfflineButton
                                            variant={'ghost'}
                                            snippet={snippet}
                                            className="w-full justify-start"
                                            disabled={isPending}
                                            onSuccess={() => setShowSaveOfflineButton(true)}
                                        />
                                    )}
                                </React.Fragment>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </DropdownMenuGroup>
                )}

                {(showForkButton || showForkToCollectionButton) && (
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                    >
                        <DropdownMenuGroup>
                            {showForkToCollectionButton && (
                                <ForkSnippetToCollection
                                    variant={'ghost'}
                                    snippetId={snippet.id}
                                    triggerAs="dropdown"
                                    mutationCallbacks={{
                                        ...forkSnippet,
                                        onSuccess: (...props) => {
                                            setOpen(false);
                                            qClient.invalidateQueries(
                                                listCurrentUserCollectionsQueryOptions(),
                                            );
                                            forkSnippet?.onSuccess?.(...props);
                                        },
                                    }}
                                    selectedCollectionId={collectionId}
                                />
                            )}
                            {showForkButton && (
                                <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                                    <ForkSnippetButton
                                        variant={'ghost'}
                                        className="w-full justify-start"
                                        snippetId={snippet.id}
                                        mutationCallbacks={{
                                            ...forkSnippet,
                                            onSuccess: (...props) => {
                                                setOpen(false);
                                                forkSnippet?.onSuccess?.(...props);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                    </PermissionGuard>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
