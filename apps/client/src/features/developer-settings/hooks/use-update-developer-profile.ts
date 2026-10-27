import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { UpdateDeveloperAccountDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type UpdateDeveloperProfileMutationCallbacks = AsyncActionCallback<
    ApiSuccess<UpdateDeveloperAccountDtoType['output']>,
    ApiClientError
>;

export function useUpdateDeveloperProfile(callbacks?: UpdateDeveloperProfileMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: UpdateDeveloperAccountDtoType['input']) => {
            return await developerApiClient.fetch<UpdateDeveloperAccountDtoType['output']>(
                apiEndpoints.developers.update.url,
                {
                    method: apiEndpoints.developers.update.method,
                    body: JSON.stringify(input),
                },
            );
        },
        onSuccess: data => {
            toast.success('Profile was updated successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
