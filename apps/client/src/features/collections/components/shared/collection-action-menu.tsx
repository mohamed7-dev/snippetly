import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { DeleteCollectionButton } from '@/features/collection-delete/components/delete-collection-button';
import type { DeleteCollectionMutationCallbacks } from '@/features/collection-delete/hooks/use-delete-collection';
import { ForkCollectionButton } from '@/features/collection-fork/components/fork-collection-button';
import type { ForkCollectionMutationCallbacks } from '@/features/collection-fork/hooks/use-fork-collection';
import type { ApiSuccess } from '@/lib/api-client';
import type { CollectionListDtoType } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { EditIcon, MoreHorizontalIcon } from 'lucide-react';
import React from 'react';

export type CollectionActionMenuProps = {
    collection: ApiSuccess<CollectionListDtoType['output']>['items'][number];
    deleteCollection?: DeleteCollectionMutationCallbacks;
    forkCollection?: ForkCollectionMutationCallbacks;
};
export function CollectionActionMenu({
    collection,
    deleteCollection,
    forkCollection,
}: CollectionActionMenuProps) {
    const { user } = useAuth();
    const [open, setOpen] = React.useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {collection.creator.id === user?.id && (
                    <DropdownMenuItem asChild>
                        <Button variant={'ghost'} className="justify-start" asChild>
                            <Link to={'/dashboard/collections/$id/edit'} params={{ id: collection.id }}>
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit Collection
                            </Link>
                        </Button>
                    </DropdownMenuItem>
                )}
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

                {collection.creator.id === user?.id && (
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
                            className="justify-start"
                            variant={'ghost'}
                        />
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
