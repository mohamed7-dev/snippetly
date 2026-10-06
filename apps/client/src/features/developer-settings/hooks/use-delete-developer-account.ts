import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { DeleteDeveloperAccountDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type DeleteDeveloperAccountMutationCallbacks = AsyncActionCallback<
    ApiSuccess<DeleteDeveloperAccountDtoType['output']>,
    ApiClientError
>;

export function useDeleteDeveloperAccount(callbacks?: DeleteDeveloperAccountMutationCallbacks) {
    return useMutation({
        mutationFn: async () => {
            return await developerApiClient.fetch<DeleteDeveloperAccountDtoType['output']>(
                apiEndpoints.developers.delete.url,
                {
                    method: apiEndpoints.developers.delete.method,
                },
            );
        },
        onSuccess: data => {
            toast.success('Account was deleted successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
