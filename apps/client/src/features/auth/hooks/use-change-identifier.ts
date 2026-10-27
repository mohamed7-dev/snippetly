import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { ChangeEmailAddressDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type ChangeIdentifierMutationCallbacks = AsyncActionCallback<
    ApiSuccess<ChangeEmailAddressDtoType['output']>,
    ApiClientError
>;

export function useChangeIdentifier(callbacks?: ChangeIdentifierMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: ChangeEmailAddressDtoType['input']) => {
            return await developerApiClient.fetch<ChangeEmailAddressDtoType['output']>(
                apiEndpoints.auth.changeEmailAddress.url,
                {
                    method: apiEndpoints.auth.changeEmailAddress.method,
                    body: JSON.stringify(input),
                },
            );
        },
        ...callbacks,
        onSuccess: data => {
            toast.success('Identifier changed successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
