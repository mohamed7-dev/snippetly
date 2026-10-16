import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { DeleteSnippetDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type DeleteSnippetAsyncActionCallbacks = AsyncActionCallback<
    ApiSuccess<DeleteSnippetDtoType['output']>,
    ApiClientError
>;

export function useDeleteSnippet(callbacks?: DeleteSnippetAsyncActionCallbacks) {
    const qClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: DeleteSnippetDtoType['input']) => {
            return await developerApiClient.fetch<DeleteSnippetDtoType['output']>(
                apiEndpoints.snippets.permanentlyDelete.url(input.id),
                {
                    method: apiEndpoints.snippets.permanentlyDelete.method,
                },
            );
        },
        ...callbacks,
        onSuccess: data => {
            toast.success('Snippet was deleted successfully');
            qClient.invalidateQueries(getCurrentDeveloperActivityStats());

            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
