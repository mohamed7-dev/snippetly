import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { UpdatePasswordDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type UpdatePasswordMutationCallbacks = AsyncActionCallback<
    ApiSuccess<UpdatePasswordDtoType['output']>,
    ApiClientError
>;

export function useUpdatePassword(callbacks?: UpdatePasswordMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: UpdatePasswordDtoType['input']) => {
            return await developerApiClient.fetch<UpdatePasswordDtoType['output']>(
                apiEndpoints.auth.updateCurrentUserPassword.url,
                {
                    method: apiEndpoints.auth.updateCurrentUserPassword.method,
                    body: JSON.stringify(input),
                },
            );
        },
        onSuccess: data => {
            toast.success('Password was updated successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
