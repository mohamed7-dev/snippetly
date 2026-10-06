import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { RefreshVerificationTokenDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type RefreshVerificationTokenMutationCallbacks = AsyncActionCallback<
    ApiSuccess<RefreshVerificationTokenDtoType['output']>,
    ApiClientError
>;

export function useRefreshVerificationToken(callbacks?: RefreshVerificationTokenMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: RefreshVerificationTokenDtoType['input']) => {
            return await developerApiClient.fetch<RefreshVerificationTokenDtoType['output']>(
                apiEndpoints.auth.refreshVerificationToken.url,
                {
                    method: apiEndpoints.auth.refreshVerificationToken.method,
                    body: JSON.stringify(input),
                },
            );
        },
        onSuccess: data => {
            toast.success('Account verification token was refreshed successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
