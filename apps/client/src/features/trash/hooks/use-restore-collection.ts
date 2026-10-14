import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { RestoreCollectionDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type RestoreCollectionMutationCallbacks = AsyncActionCallback<
    ApiSuccess<RestoreCollectionDtoType['output']>,
    ApiClientError
>;

export function useRestoreCollection(callbacks?: RestoreCollectionMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: RestoreCollectionDtoType['input']) => {
            const endpoint = apiEndpoints.collections.restore;
            return developerApiClient.fetch<RestoreCollectionDtoType['output']>(endpoint.url(input.id), {
                method: endpoint.method,
            });
        },
        ...callbacks,
        onSuccess: async data => {
            toast.success(`Collection restored successfully`);
            callbacks?.onSuccess?.(data);
            // await queryClient.invalidateQueries({ queryKey: ['trash'] });
            // await queryClient.invalidateQueries({
            //     queryKey: resource === 'snippet' ? ['snippets', 'current'] : ['collections', 'current'],
            // });
        },
        onError: e => {
            toastApiError(e as ApiClientError);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
