import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { CreateCollectionDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type MutationCallbacks = AsyncActionCallback<
    ApiSuccess<CreateCollectionDtoType['output']>,
    ApiClientError
>;

export function useCreateCollection(mutationCallbacks?: MutationCallbacks) {
    return useMutation({
        mutationFn: async (input: CreateCollectionDtoType['input']) => {
            return await developerApiClient.fetch<CreateCollectionDtoType['output']>(
                apiEndpoints.collections.create.url,
                {
                    method: apiEndpoints.collections.create.method,
                    body: JSON.stringify(input),
                },
            );
        },
        ...mutationCallbacks,
        onSuccess: data => {
            toast.success('Collection was created successfully');
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
