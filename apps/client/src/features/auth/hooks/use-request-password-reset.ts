import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { AsyncActionCallback } from '@/lib/types';
import type { RequestPasswordResetDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';

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
            callbacks?.onSuccess?.(data, variables);
        },
    });
}
