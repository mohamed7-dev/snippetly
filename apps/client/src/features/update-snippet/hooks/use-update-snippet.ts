import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { OfflineNetworkError } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { UpdateSnippetDtoType } from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { getOfflineCreationOwnerId } from '@/features/offline-snippet/lib/offline-creation-access';
import { queueOfflineSnippetUpdate } from '@/features/offline-snippet/lib/store';
import { getSnippetQueryOptions } from '@/features/snippets/lib/snippet-query-options';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import React from 'react';

export type UpdateSnippetMutationCallbacks = AsyncActionCallback<
    ApiSuccess<UpdateSnippetDtoType['output']>,
    ApiClientError
>;

export function useUpdateSnippet(mutationCallbacks?: UpdateSnippetMutationCallbacks) {
    const qClient = useQueryClient();
    const queuedResults = React.useRef(new WeakSet<object>());
    return useMutation({
        mutationFn: async (input: UpdateSnippetDtoType['input']) => {
            if (!navigator.onLine) {
                const ownerId = getOfflineCreationOwnerId();
                if (!ownerId) throw new Error('Sign in on this device before editing snippets offline.');
                const updated = await queueOfflineSnippetUpdate(ownerId, input);
                queuedResults.current.add(updated);
                return updated;
            }

            try {
                return await developerApiClient.fetch<UpdateSnippetDtoType['output']>(
                    apiEndpoints.snippets.update.url(input.id),
                    {
                        method: apiEndpoints.snippets.update.method,
                        body: JSON.stringify(omit(input, ['id'])),
                    },
                );
            } catch (error) {
                if (!(error instanceof OfflineNetworkError)) throw error;
                const ownerId = getOfflineCreationOwnerId();
                if (!ownerId) throw error;
                const updated = await queueOfflineSnippetUpdate(ownerId, input);
                queuedResults.current.add(updated);
                return updated;
            }
        },
        ...mutationCallbacks,
        onSuccess: async data => {
            const wasQueued = queuedResults.current.delete(data);
            if (wasQueued) {
                qClient.setQueryData(getSnippetQueryOptions(data.id).queryKey, current =>
                    current ? { ...current, ...data, tags: data.tags ?? [] } : current,
                );
            }
            toast.success(
                wasQueued
                    ? 'Snippet update saved and will sync when you are online.'
                    : 'Snippet was updated successfully',
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
