import { developerApiClient, type ApiClientError } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { RevokeSessionDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useRevokeSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sessionId: string) =>
            developerApiClient.fetch<RevokeSessionDtoType['output']>(
                apiEndpoints.auth.revokeSession.url(sessionId),
                { method: apiEndpoints.auth.revokeSession.method },
            ),
        onSuccess: () => {
            toast.success('Session signed out successfully');
            void queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
        },
        onError: error => toastApiError(error as ApiClientError),
    });
}
