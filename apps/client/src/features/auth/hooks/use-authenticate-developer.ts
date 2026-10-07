import { type ApiClientError } from '@/lib/api-client';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { AuthenticateDeveloperDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

type AuthenticateDeveloperMutationCallbacks = AsyncActionCallback<void, ApiClientError>;

export function useAuthenticateDeveloper(callbacks?: AuthenticateDeveloperMutationCallbacks) {
    const { login } = useAuth();

    return useMutation({
        mutationFn: async (input: AuthenticateDeveloperDtoType['input']) => {
            return login(input, 'developer', () => {});
        },
        ...callbacks,
        onSuccess: data => {
            toast.success('Authenticated successfully');
            callbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
