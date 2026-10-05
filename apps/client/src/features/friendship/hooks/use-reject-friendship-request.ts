import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { RejectFriendshipRequestDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type RejectFriendshipRequestMutationCallbacks = AsyncActionCallback<
    ApiSuccess<RejectFriendshipRequestDtoType['output']>,
    ApiClientError
>;

export function useRejectFriendshipRequest(mutationCallbacks?: RejectFriendshipRequestMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: RejectFriendshipRequestDtoType['input']) => {
            return await developerApiClient.fetch<RejectFriendshipRequestDtoType['output']>(
                apiEndpoints.friendships.reject.url(input.friendId),
                { method: apiEndpoints.friendships.reject.method },
            );
        },
        ...mutationCallbacks,
        onSuccess: data => {
            toast.success('Friendship request was rejected successfully');
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
