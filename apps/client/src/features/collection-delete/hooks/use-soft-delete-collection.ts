import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { DeleteCollectionDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type SoftDeleteCollectionMutationCallbacks = AsyncActionCallback<
    ApiSuccess<DeleteCollectionDtoType['output']>,
    ApiClientError
>;

export function useSoftDeleteCollection(callbacks?: SoftDeleteCollectionMutationCallbacks) {
    const qClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: DeleteCollectionDtoType['input']) => {
            return await developerApiClient.fetch<DeleteCollectionDtoType['output']>(
                apiEndpoints.collections.delete.url(input.id),
                {
                    method: apiEndpoints.collections.delete.method,
                },
            );
        },
        ...callbacks,
        onSuccess: data => {
            toast.success('Collection moved to trash');
            qClient.invalidateQueries(getCurrentDeveloperActivityStats());
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
