import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { CreateSnippetDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type CreateSnippetMutationCallbacks = AsyncActionCallback<
    ApiSuccess<CreateSnippetDtoType['output']>,
    ApiClientError
>;

export function useCreateSnippet(mutationCallbacks?: CreateSnippetMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: CreateSnippetDtoType['input']) => {
            return await developerApiClient.fetch<CreateSnippetDtoType['output']>(
                apiEndpoints.snippets.create.url,
                {
                    method: apiEndpoints.snippets.create.method,
                    body: JSON.stringify(input),
                },
            );
        },
        ...mutationCallbacks,
        onSuccess: data => {
            toast.success('Snippet was created successfully');
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
