import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { DeleteCollectionDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type DeleteCollectionMutationCallbacks = AsyncActionCallback<
    ApiSuccess<DeleteCollectionDtoType['output']>,
    ApiClientError
>;

export function useDeleteCollection(callbacks?: DeleteCollectionMutationCallbacks) {
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
        onSuccess: data => {
            toast.success('Collection was deleted successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
