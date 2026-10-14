import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { RestoreSnippetDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type RestoreSnippetMutationCallbacks = AsyncActionCallback<
    ApiSuccess<RestoreSnippetDtoType['output']>,
    ApiClientError
>;

export function useRestoreSnippet(callbacks?: RestoreSnippetMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: RestoreSnippetDtoType['input']) => {
            const endpoint = apiEndpoints.snippets.restore;
            return developerApiClient.fetch<RestoreSnippetDtoType['output']>(endpoint.url(input.id), {
                method: endpoint.method,
            });
        },
        ...callbacks,
        onSuccess: async data => {
            toast.success(`Snippet restored successfully`);
            callbacks?.onSuccess?.(data);
            // await queryClient.invalidateQueries({ queryKey: ['trash'] });
            // await queryClient.invalidateQueries({
            //     queryKey: resource === 'snippet' ? ['snippets', 'current'] : ['collections', 'current'],
            // });
        },
        onError: e => {
            toastApiError(e as ApiClientError);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
