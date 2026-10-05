import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { UpdateSnippetDtoType } from '@snippetly/common/dto';
import { omit } from '@snippetly/common/lib';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type UpdateSnippetMutationCallbacks = AsyncActionCallback<
    ApiSuccess<UpdateSnippetDtoType['output']>,
    ApiClientError
>;

export function useUpdateSnippet(mutationCallbacks?: UpdateSnippetMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: UpdateSnippetDtoType['input']) => {
            return await developerApiClient.fetch<UpdateSnippetDtoType['output']>(
                apiEndpoints.snippets.update.url(input.id),
                {
                    method: apiEndpoints.snippets.update.method,
                    body: JSON.stringify(omit(input, ['id'])),
                },
            );
        },
        ...mutationCallbacks,
        onSuccess: data => {
            toast.success('Snippet was updated successfully');
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
