import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { CreateCollectionIcon } from '@/components/shared/creation-icons';
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
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getOfflineOwnerId, listOfflineCollectionOptions } from '@/features/offline-snippet/lib/store';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { listCurrentUserCollectionsQueryOptions } from '../../lib/collection-listing-query-options';
import { CollectionItem } from './collection-item';

export type CurrentUserCollectionsOverlayProps = {
    onSelect: (id: string, name: string) => void;
    onOpenChange?: (open: boolean) => void;
    isOpen: boolean;
    selectedCollectionId?: string;
    createCollectionRedirect?: string;
};
export function CurrentUserCollectionsOverlay({
    onSelect,
    onOpenChange,
    isOpen,
    selectedCollectionId,
    createCollectionRedirect,
}: CurrentUserCollectionsOverlayProps) {
    const { user } = useAuth();
    const ownerId = user?.id ?? getOfflineOwnerId();
    const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery({
        ...listCurrentUserCollectionsQueryOptions(),
        enabled: !!user?.id && navigator.onLine,
    });
    const offlineCollections = useLiveQuery(
        () => (ownerId ? listOfflineCollectionOptions(ownerId) : []),
        [ownerId],
    );
    const collectionMap = new Map(
        (data?.pages?.flatMap(page => page.items) ?? []).map(collection => [
            collection.id,
            {
                id: collection.id,
                name: collection.name,
                color: collection.color,
            },
        ]),
    );
    for (const collection of offlineCollections ?? []) {
        collectionMap.set(collection.id, collection);
    }
    const collections = [...collectionMap.values()];
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
                        fetchNextPage={() => void fetchNextPage()}
                        hasNextPage={navigator.onLine && !!hasNextPage}
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
                                            <Link
                                                to="/dashboard/collections/new"
                                                search={{
                                                    redirect: createCollectionRedirect ?? location.href,
                                                }}
                                            >
                                                <CreateCollectionIcon className="mr-2 size-4" />
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
                    <Link
                        to="/dashboard/collections/new"
                        search={{ redirect: createCollectionRedirect ?? location.href }}
                    >
                        <CreateCollectionIcon className="size-4" />
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
