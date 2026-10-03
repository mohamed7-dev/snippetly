import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { UpdateCollectionDtoType } from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type UpdateCollectionMutationCallbacks = AsyncActionCallback<
    ApiSuccess<UpdateCollectionDtoType['output']>,
    ApiClientError
>;

export function useUpdateCollection(mutationCallbacks?: UpdateCollectionMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: UpdateCollectionDtoType['input']) => {
            return await developerApiClient.fetch<UpdateCollectionDtoType['output']>(
                apiEndpoints.collections.update.url(input.id),
                {
                    method: apiEndpoints.collections.update.method,
                    body: JSON.stringify(omit(input, ['id'])),
                },
            );
        },
        ...mutationCallbacks,
        onSuccess: data => {
            toast.success('Collection was updated successfully');
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
