import { useAuth } from '@/features/auth/hooks/use-auth';
import {
    insertExplicitOfflineCollection,
    listExplicitOfflineCollections,
    removeExplicitOfflineCollection,
    type InsertOfflineCollectionInput,
} from '@/features/offline-snippet/lib/store';
import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';
import { toast } from 'sonner';

export function useOfflineCollectionStore() {
    const { user } = useAuth();
    const savedBy = user?.id;
    const [isSaving, setIsSaving] = React.useState(false);
    const [isRemoving, setIsRemoving] = React.useState(false);
    const collections = useLiveQuery(() => listExplicitOfflineCollections(savedBy), [savedBy]);

    const insert = async (collection: InsertOfflineCollectionInput): Promise<boolean> => {
        setIsSaving(true);
        try {
            await insertExplicitOfflineCollection({ ...collection, savedBy });
            toast.success('Collection saved for offline use');
            return true;
        } catch (error) {
            toast.error(
                error instanceof DOMException ? error.message : 'Failed to save collection for offline use',
            );
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const remove = async (id: string): Promise<boolean> => {
        setIsRemoving(true);
        try {
            await removeExplicitOfflineCollection({ id, savedBy });
            toast.success('Collection removed from offline storage');
            return true;
        } catch (error) {
            toast.error(
                error instanceof DOMException
                    ? error.message
                    : 'Failed to remove collection from offline storage',
            );
            return false;
        } finally {
            setIsRemoving(false);
        }
    };

    return {
        insert: { mutate: insert, isPending: isSaving },
        remove: { mutate: remove, isPending: isRemoving },
        list: { data: collections, isPending: collections === undefined },
    };
}
