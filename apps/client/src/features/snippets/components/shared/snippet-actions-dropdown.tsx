import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { RemoveSnippetOfflineButton } from '@/features/offline-snippet/components/remove-snippet-offline-button';
import { SaveSnippetOfflineButton } from '@/features/offline-snippet/components/save-snippet-offline-button';
import { useOfflineSnippetStore } from '@/features/offline-snippet/hooks/use-offline-snippet-store';
import { DeleteSnippetButton } from '@/features/snippet-delete/components/delete-snippet-button';
import type { DeleteSnippetAsyncActionCallbacks } from '@/features/snippet-delete/hooks/use-delete-snippet';
import { ForkSnippetButton } from '@/features/snippet-fork/components/fork-snippet-button';
import { ForkSnippetToCollection } from '@/features/snippet-fork/components/fork-snippet-to-collection';
import type { ForkSnippetMutationCallbacks } from '@/features/snippet-fork/hooks/use-fork-snippet';
import { CopyButton } from '@/features/snippets/components/shared/copy-button';
import { useCopyCode } from '@/features/snippets/hooks/use-copy-code';
import { type ApiSuccess } from '@/lib/api-client';
import type { SnippetListDtoType } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { EditIcon, EyeIcon, MoreHorizontalIcon } from 'lucide-react';
import React from 'react';

export interface SnippetActionsDropdownProps {
    snippet: ApiSuccess<SnippetListDtoType['output']>['items'][number];
    onCopy?: (code: string) => void;
    deleteSnippet?: DeleteSnippetAsyncActionCallbacks;
    forkSnippet?: ForkSnippetMutationCallbacks;
    Trigger?: React.ReactNode;
}

export function SnippetActionsDropdown({
    snippet,
    onCopy,
    deleteSnippet,
    forkSnippet,
    Trigger,
}: SnippetActionsDropdownProps) {
    const { user } = useAuth();
    const [open, setOpen] = React.useState(false);
    const {
        getOne: { query: getOfflineSnippet, isPending },
    } = useOfflineSnippetStore();
    const [showSaveOfflineButton, setShowSaveOfflineButton] = React.useState(() => true);
    const collectionId = 'collection' in snippet ? snippet.collection?.id : undefined;
    // copy
    const { copyCode } = useCopyCode({ code: snippet.code });
    const handleCopy = () => {
        copyCode();
        onCopy?.(snippet.code);
    };

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
                <DropdownMenuItem asChild>
                    <CopyButton
                        code={snippet.code}
                        variant={'ghost'}
                        className="w-full justify-start"
                        onClick={handleCopy}
                    />
                </DropdownMenuItem>
                {user && (
                    <ForkSnippetToCollection
                        snippetId={snippet.id}
                        triggerAs="dropdown"
                        mutationCallbacks={{
                            ...forkSnippet,
                            onSuccess: (...props) => {
                                setOpen(false);
                                forkSnippet?.onSuccess?.(...props);
                            },
                        }}
                        selectedCollectionId={collectionId}
                    />
                )}
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
                {user && (
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
                )}
                {snippet.creator.id === user?.id && (
                    <React.Fragment>
                        <DropdownMenuItem asChild>
                            <Button variant={'ghost'} size={'sm'} className="w-full justify-start" asChild>
                                <Link
                                    to="/dashboard/snippets/$id/edit"
                                    params={{ id: snippet.id }}
                                    preload={false}
                                >
                                    <EditIcon className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Button variant={'ghost'} size={'sm'} className="w-full justify-start" asChild>
                                <Link
                                    to="/dashboard/snippets/$id"
                                    params={{ id: snippet.id }}
                                    preload={false}
                                >
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    View Details
                                </Link>
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
                    </React.Fragment>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
