import { developerApiClient, type ApiClientError, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { RegisterDeveloperAccountDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type RegisterDeveloperAccountMutationCallbacks = AsyncActionCallback<
    ApiSuccess<RegisterDeveloperAccountDtoType['output']>,
    ApiClientError,
    RegisterDeveloperAccountDtoType['input']
>;

export function useRegisterDeveloperAccount(callbacks?: RegisterDeveloperAccountMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: RegisterDeveloperAccountDtoType['input']) => {
            return await developerApiClient.fetch<RegisterDeveloperAccountDtoType['output']>(
                apiEndpoints.auth.registerDeveloper.url,
                {
                    method: apiEndpoints.auth.registerDeveloper.method,
                    body: JSON.stringify(input),
                },
            );
        },
        ...callbacks,
        onSuccess: (data, variables) => {
            toast.success('Account was registered successfully');
            callbacks?.onSuccess?.(data, variables);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
