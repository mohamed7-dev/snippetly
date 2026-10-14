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
    Trigger?: React.ReactNode;
}

export function SnippetActionsDropdown({
    snippet,
    deleteSnippet,
    moveSnippetToTrash,
    forkSnippet,
    Trigger,
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Button variant={'ghost'} size={'sm'} className="w-full justify-start" asChild>
                            <Link to="/dashboard/snippets/$id" params={{ id: snippet.id }} preload={false}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </Button>
                    </DropdownMenuItem>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.Owner,
                            Permission.UpdateSnippet,
                        ]}
                        ownerId={snippet.creator.id}
                    >
                        <DropdownMenuItem asChild>
                            <Button variant={'ghost'} size={'sm'} className="w-full justify-start" asChild>
                                <Link
                                    to="/dashboard/snippets/$id/edit"
                                    params={{ id: snippet.id }}
                                    preload={false}
                                >
                                    <EditIcon className="mr-2 h-4 w-4" />
                                    Edit Snippet
                                </Link>
                            </Button>
                        </DropdownMenuItem>
                    </PermissionGuard>
                    <DropdownMenuSeparator />
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.Owner,
                            Permission.DeleteSnippet,
                        ]}
                        ownerId={snippet.creator.id}
                    >
                        <DropdownMenuItem asChild>
                            <MoveSnippetToTrashButton
                                snippetId={snippet.id}
                                variant={'ghost'}
                                className="justify-start"
                                mutationCallbacks={{
                                    ...moveSnippetToTrash,
                                    onSuccess: (...props) => {
                                        setOpen(false);
                                        moveSnippetToTrash?.onSuccess?.(...props);
                                    },
                                }}
                            />
                        </DropdownMenuItem>
                    </PermissionGuard>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.Owner,
                            Permission.DeleteSnippet,
                        ]}
                        ownerId={snippet.creator.id}
                    >
                        <DropdownMenuItem asChild>
                            <DeleteSnippetButton
                                snippetId={snippet.id}
                                variant={'ghost'}
                                className="justify-start"
                                mutationCallbacks={{
                                    ...deleteSnippet,
                                    onSuccess: (...props) => {
                                        setOpen(false);
                                        deleteSnippet?.onSuccess?.(...props);
                                    },
                                }}
                            />
                        </DropdownMenuItem>
                    </PermissionGuard>
                    <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                        {showSaveOfflineButton ? (
                            <SaveSnippetOfflineButton
                                variant={'ghost'}
                                snippet={snippet}
                                className="justify-start"
                                disabled={isPending}
                                onSuccess={() => setShowSaveOfflineButton(false)}
                            />
                        ) : (
                            <RemoveSnippetOfflineButton
                                variant={'ghost'}
                                snippet={snippet}
                                className="justify-start"
                                disabled={isPending}
                                onSuccess={() => setShowSaveOfflineButton(true)}
                            />
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </DropdownMenuGroup>

                <DropdownMenuGroup>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                    >
                        <ForkSnippetToCollection
                            snippetId={snippet.id}
                            triggerAs="dropdown"
                            mutationCallbacks={{
                                ...forkSnippet,
                                onSuccess: (...props) => {
                                    setOpen(false);
                                    qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
                                    forkSnippet?.onSuccess?.(...props);
                                },
                            }}
                            selectedCollectionId={collectionId}
                        />
                        <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                            <ForkSnippetButton
                                className="justify-start"
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
                        <DropdownMenuSeparator />
                    </PermissionGuard>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <CopyButton code={snippet.code} variant={'ghost'} className="w-full justify-start" />
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
