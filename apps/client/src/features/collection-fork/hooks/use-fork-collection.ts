import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { ForkCollectionDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ForkCollectionMutationCallbacks = AsyncActionCallback<
    ApiSuccess<ForkCollectionDtoType['output']>,
    ApiClientError
>;

export function useForkCollection(callbacks?: ForkCollectionMutationCallbacks) {
    const qClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: ForkCollectionDtoType['input']) => {
            return await developerApiClient.fetch<ForkCollectionDtoType['output']>(
                apiEndpoints.collections.fork.url(input.id),
                {
                    method: apiEndpoints.collections.fork.method,
                },
            );
        },
        ...callbacks,
        onSuccess: data => {
            toast.success('Collection was forked successfully');
            qClient.invalidateQueries(getCurrentDeveloperActivityStats());
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
