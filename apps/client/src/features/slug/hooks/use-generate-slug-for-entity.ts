import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { GenerateSlugForEntityDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';

type MutationCallbacks = AsyncActionCallback<
    ApiSuccess<GenerateSlugForEntityDtoType['output']>,
    ApiClientError
>;

export function useGenerateSlugForEntity(mutationCallbacks?: MutationCallbacks) {
    return useMutation({
        mutationFn: async (input: GenerateSlugForEntityDtoType['input']) => {
            return await developerApiClient.fetch<GenerateSlugForEntityDtoType['output']>(
                apiEndpoints.slugs.generateSlugForEntity.url,
                {
                    method: apiEndpoints.slugs.generateSlugForEntity.method,
                    body: JSON.stringify(input),
                },
            );
        },
        ...mutationCallbacks,
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
