import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { VerifyAccountDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type VerifyAccountMutationCallbacks = AsyncActionCallback<
    ApiSuccess<VerifyAccountDtoType['output']>,
    ApiClientError
>;

export function useVerifyAccount(callbacks?: VerifyAccountMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: VerifyAccountDtoType['input']) => {
            return await developerApiClient.fetch<VerifyAccountDtoType['output']>(
                apiEndpoints.auth.verifyAccount.url,
                {
                    method: apiEndpoints.auth.verifyAccount.method,
                    body: JSON.stringify(input),
                },
            );
        },
        onSuccess: data => {
            toast.success('Account was verified successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
