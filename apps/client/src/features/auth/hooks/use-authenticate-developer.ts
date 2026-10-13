import { type ApiClientError } from '@/lib/api-client';
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
            await login(input, 'developer');
        },
        ...callbacks,
        onSuccess: async data => {
            toast.success('Authenticated successfully');
            await callbacks?.onSuccess?.(data);
        },
        onError: e => {
            callbacks?.onError?.(e as ApiClientError);
        },
    });
}
