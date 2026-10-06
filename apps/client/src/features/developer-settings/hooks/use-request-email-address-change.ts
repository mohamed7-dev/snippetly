import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { RequestEmailAddressChangeDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type RequestEmailAddressChangeMutationCallbacks = AsyncActionCallback<
    ApiSuccess<RequestEmailAddressChangeDtoType['output']>,
    ApiClientError
>;

export function useRequestEmailAddressChange(callbacks?: RequestEmailAddressChangeMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: RequestEmailAddressChangeDtoType['input']) => {
            return await developerApiClient.fetch<RequestEmailAddressChangeDtoType['output']>(
                apiEndpoints.auth.requestEmailAddressChange.url,
                {
                    method: apiEndpoints.auth.requestEmailAddressChange.method,
                    body: JSON.stringify(input),
                },
            );
        },
        onSuccess: data => {
            toast.success('Email address change request was sent successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
