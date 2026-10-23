import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { getOfflineOwnerId, queueOfflineCollectionUpdate } from '@/features/offline-snippet/lib/store';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { ApiClientError, developerApiClient, OfflineNetworkError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { UpdateCollectionDtoType } from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

export type UpdateCollectionMutationCallbacks = AsyncActionCallback<
    ApiSuccess<UpdateCollectionDtoType['output']>,
    ApiClientError
>;

export function useUpdateCollection(mutationCallbacks?: UpdateCollectionMutationCallbacks) {
    const qClient = useQueryClient();
    const queuedResults = React.useRef(new WeakSet<object>());
    return useMutation({
        mutationFn: async (input: UpdateCollectionDtoType['input']) => {
            if (!navigator.onLine) {
                const ownerId = getOfflineOwnerId();
                if (!ownerId) throw new Error('Sign in on this device before editing collections offline.');
                const updated = await queueOfflineCollectionUpdate(ownerId, input);
                queuedResults.current.add(updated);
                return updated;
            }

            try {
                return await developerApiClient.fetch<UpdateCollectionDtoType['output']>(
                    apiEndpoints.collections.update.url(input.id),
                    {
                        method: apiEndpoints.collections.update.method,
                        body: JSON.stringify(omit(input, ['id'])),
                    },
                );
            } catch (error) {
                if (!(error instanceof OfflineNetworkError)) throw error;
                const ownerId = getOfflineOwnerId();
                if (!ownerId) throw error;
                const updated = await queueOfflineCollectionUpdate(ownerId, input);
                queuedResults.current.add(updated);
                return updated;
            }
        },
        ...mutationCallbacks,
        onSuccess: data => {
            const wasQueued = queuedResults.current.delete(data);
            if (wasQueued) {
                qClient.setQueryData(getCollectionQueryOptions(data.id).queryKey, current =>
                    current ? { ...current, ...data, tags: data.tags ?? current.tags ?? [] } : current,
                );
            }
            toast.success(
                wasQueued
                    ? 'Collection update saved and will sync when you are online.'
                    : 'Collection was updated successfully',
            );
            qClient.invalidateQueries(getCurrentDeveloperActivityStats());
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
