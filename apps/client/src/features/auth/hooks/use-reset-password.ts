import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { AsyncActionCallback } from '@/lib/types';
import type { ResetPasswordDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';

export type ResetPasswordMutationCallbacks = AsyncActionCallback<
    ApiSuccess<ResetPasswordDtoType['output']>,
    ApiClientError,
    ResetPasswordDtoType['input']
>;

export function useResetPassword(callbacks?: ResetPasswordMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: ResetPasswordDtoType['input']) => {
            return await developerApiClient.fetch<ResetPasswordDtoType['output']>(
                apiEndpoints.auth.resetPassword.url,
                {
                    method: apiEndpoints.auth.resetPassword.method,
                    body: JSON.stringify(input),
                },
            );
        },
        ...callbacks,
        onSuccess: (data, variables) => {
            callbacks?.onSuccess?.(data, variables);
        },
        onError: e => {
            // toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
