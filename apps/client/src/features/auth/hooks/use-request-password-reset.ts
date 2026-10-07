import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { RequestPasswordResetDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type RequestPasswordResetMutationCallbacks = AsyncActionCallback<
    ApiSuccess<RequestPasswordResetDtoType['output']>,
    ApiClientError,
    RequestPasswordResetDtoType['input']
>;

export function useRequestPasswordReset(callbacks?: RequestPasswordResetMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: RequestPasswordResetDtoType['input']) => {
            return await developerApiClient.fetch<RequestPasswordResetDtoType['output']>(
                apiEndpoints.auth.requestPasswordReset.url,
                {
                    method: apiEndpoints.auth.requestPasswordReset.method,
                    body: JSON.stringify(input),
                },
            );
        },
        ...callbacks,
        onSuccess: (data, variables) => {
            toast.success('Password reset request was sent successfully');
            callbacks?.onSuccess?.(data, variables);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
