import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { ForkSnippetDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ForkSnippetMutationCallbacks = AsyncActionCallback<
    ApiSuccess<ForkSnippetDtoType['output']>,
    ApiClientError
>;

export function useForkSnippet(callbacks?: ForkSnippetMutationCallbacks) {
    const qClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: ForkSnippetDtoType['input']) => {
            return await developerApiClient.fetch<ForkSnippetDtoType['output']>(
                apiEndpoints.snippets.fork.url(input.id),
                {
                    method: apiEndpoints.snippets.fork.method,
                    body: JSON.stringify({ collectionId: input.collectionId }),
                },
            );
        },
        onSuccess: data => {
            toast.success('Snippet was forked successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
