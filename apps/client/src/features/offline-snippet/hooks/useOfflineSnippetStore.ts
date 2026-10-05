import React from 'react';
import { toast } from 'sonner';
import {
    getOfflineSnippet,
    insertOfflineSnippet,
    listOfflineSnippets,
    removeOfflineSnippet,
    updateOfflineSnippet,
    type GetOfflineSnippetInput,
    type InsertOfflineSnippetInput,
    type OfflineSnippetItem,
    type RemoveOfflineSnippetInput,
    type UpdateOfflineSnippetInput,
} from '../lib/store';

export function useOfflineSnippetStore() {
    const [status, setStatus] = React.useState({
        isInserting: false,
        isUpdating: false,
        isRemoving: false,
        isListing: false,
        isGettingOne: false,
    });

    const onError = React.useCallback((e: unknown, action: 'save' | 'update' | 'remove' | 'get' | 'list') => {
        if (e instanceof DOMException) {
            toast.error(e.message);
        } else {
            toast.error(`Failed to ${action} offline snippet${action === 'list' ? 's' : ''}`);
        }
    }, []);

    const insert = async (input: InsertOfflineSnippetInput) => {
        setStatus(prev => ({ ...prev, isInserting: true }));

        try {
            await insertOfflineSnippet(input);
            toast.success('Saved for offline use');
        } catch (e) {
            onError(e, 'save');
        } finally {
            setStatus(prev => ({ ...prev, isInserting: false }));
        }
    };

    const update = async (input: UpdateOfflineSnippetInput) => {
        setStatus(prev => ({ ...prev, isUpdating: true }));

        try {
            await updateOfflineSnippet(input);
            toast.success('Offline snippet was updated successfully');
        } catch (e) {
            onError(e, 'update');
        } finally {
            setStatus(prev => ({ ...prev, isUpdating: false }));
        }
    };

    const remove = async (input: RemoveOfflineSnippetInput) => {
        setStatus(prev => ({ ...prev, isRemoving: true }));

        try {
            await removeOfflineSnippet(input);
            toast.success('Snippet was removed from the offline store.');
        } catch (e) {
            onError(e, 'remove');
        } finally {
            setStatus(prev => ({ ...prev, isRemoving: false }));
        }
    };

    const getOne = React.useCallback(
        async (input: GetOfflineSnippetInput) => {
            setStatus(prev => ({ ...prev, isGettingOne: true }));

            try {
                return await getOfflineSnippet(input);
            } catch (e) {
                onError(e, 'get');
            } finally {
                setStatus(prev => ({ ...prev, isGettingOne: false }));
            }
        },
        [onError],
    );

    const list = React.useCallback(async (): Promise<OfflineSnippetItem[]> => {
        setStatus(prev => ({ ...prev, isListing: true }));

        try {
            return await listOfflineSnippets();
        } catch (e) {
            onError(e, 'list');
            return [];
        } finally {
            setStatus(prev => ({ ...prev, isListing: false }));
        }
    }, [onError]);

    return {
        insert: { mutate: insert, isPending: status.isInserting },
        update: {
            mutate: update,
            isPending: status.isUpdating,
        },
        remove: {
            mutate: remove,
            isPending: status.isRemoving,
        },
        getOne: {
            query: getOne,
            isPending: status.isGettingOne,
        },
        list: {
            query: list,
            isPending: status.isListing,
        },
    };
}
