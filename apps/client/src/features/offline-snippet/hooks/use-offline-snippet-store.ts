import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLiveQuery } from 'dexie-react-hooks';
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
    type RemoveOfflineSnippetInput,
    type UpdateOfflineSnippetInput,
} from '../lib/store';

export function useOfflineSnippetStore() {
    const { user } = useAuth();
    const savedBy = user?.id;
    const [status, setStatus] = React.useState({
        isInserting: false,
        isUpdating: false,
        isRemoving: false,
        isGettingOne: false,
    });
    const snippets = useLiveQuery(() => listOfflineSnippets(savedBy), [savedBy]);

    const onError = React.useCallback((e: unknown, action: 'save' | 'update' | 'remove' | 'get' | 'list') => {
        if (e instanceof DOMException) {
            toast.error(e.message);
        } else {
            toast.error(`Failed to ${action} offline snippet${action === 'list' ? 's' : ''}`);
        }
    }, []);

    const insert = async (input: Omit<InsertOfflineSnippetInput, 'savedBy'>): Promise<boolean> => {
        setStatus(prev => ({ ...prev, isInserting: true }));

        try {
            await insertOfflineSnippet({ ...input, savedBy });
            toast.success('Saved for offline use');
            return true;
        } catch (e) {
            onError(e, 'save');
            return false;
        } finally {
            setStatus(prev => ({ ...prev, isInserting: false }));
        }
    };

    const update = async (input: UpdateOfflineSnippetInput): Promise<boolean> => {
        setStatus(prev => ({ ...prev, isUpdating: true }));

        try {
            await updateOfflineSnippet(input);
            toast.success('Offline snippet was updated successfully');
            return true;
        } catch (e) {
            onError(e, 'update');
            return false;
        } finally {
            setStatus(prev => ({ ...prev, isUpdating: false }));
        }
    };

    const remove = async (input: RemoveOfflineSnippetInput): Promise<boolean> => {
        setStatus(prev => ({ ...prev, isRemoving: true }));

        try {
            await removeOfflineSnippet(input);
            toast.success('Snippet was removed from the offline store.');
            return true;
        } catch (e) {
            onError(e, 'remove');
            return false;
        } finally {
            setStatus(prev => ({ ...prev, isRemoving: false }));
        }
    };

    const getOne = React.useCallback(
        async (input: Omit<GetOfflineSnippetInput, 'savedBy'>) => {
            setStatus(prev => ({ ...prev, isGettingOne: true }));

            try {
                return await getOfflineSnippet({ ...input, savedBy });
            } catch (e) {
                onError(e, 'get');
            } finally {
                setStatus(prev => ({ ...prev, isGettingOne: false }));
            }
        },
        [onError, savedBy],
    );

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
            data: snippets,
            isPending: snippets === undefined,
        },
    };
}
