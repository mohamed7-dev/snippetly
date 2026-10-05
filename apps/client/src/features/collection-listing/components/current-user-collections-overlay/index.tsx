import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { listCurrentUserCollectionsQueryOptions } from '../../lib/collection-listing-query-options';
import { CollectionItem } from './collection-item';

export type CurrentUserCollectionsOverlayProps = {
    onSelect: (id: string, name: string) => void;
    onOpenChange?: (open: boolean) => void;
    isOpen: boolean;
    selectedCollectionId?: string;
};
export function CurrentUserCollectionsOverlay({
    onSelect,
    onOpenChange,
    isOpen,
    selectedCollectionId,
}: CurrentUserCollectionsOverlayProps) {
    const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery(
        listCurrentUserCollectionsQueryOptions(),
    );
    const collections = data?.pages?.flatMap(p => p.items) ?? [];
    const handleOpenChange = (open: boolean) => {
        onOpenChange?.(open);
    };

    const handleSelect = (id: string, name: string) => {
        onSelect(id, name);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Your Collections</AlertDialogTitle>
                    <AlertDialogDescription>
                        Pick one of these collections to continue.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 md:max-h-[70vh] md:overflow-y-auto">
                    {collections.map(collection => (
                        <CollectionItem
                            key={collection.id}
                            collection={collection}
                            onSelect={(id, name) => handleSelect(id, name)}
                            selectedItemId={selectedCollectionId}
                        />
                    ))}
                    <InfiniteLoader
                        fetchNextPage={fetchNextPage}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        Content={
                            !collections?.length ? (
                                <StatusCard
                                    variant="empty"
                                    title="No collections yet"
                                    description="Create your first collection to organize your code snippets"
                                    layout="section"
                                    actions={
                                        <Button asChild>
                                            <Link to={'/dashboard/collections/new'}>
                                                <PlusIcon className="h-4 w-4 mr-2" />
                                                Create Collection
                                            </Link>
                                        </Button>
                                    }
                                />
                            ) : null
                        }
                    />
                </div>
                <Button size={'lg'} asChild>
                    <Link to="/dashboard/collections/new" search={{ redirect: location.href }}>
                        <PlusIcon />
                        <span>Add New Collection</span>
                    </Link>
                </Button>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant={'ghost'}>Cancel</Button>
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
