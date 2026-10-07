import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { ResetPasswordDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

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
            toast.success('Password was reset successfully');
            callbacks?.onSuccess?.(data, variables);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
