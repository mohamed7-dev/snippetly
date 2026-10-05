import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { AcceptFriendshipRequestDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type AcceptFriendshipRequestMutationCallbacks = AsyncActionCallback<
    ApiSuccess<AcceptFriendshipRequestDtoType['output']>,
    ApiClientError
>;

export function useAcceptFriendshipRequest(mutationCallbacks?: AcceptFriendshipRequestMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: AcceptFriendshipRequestDtoType['input']) => {
            return await developerApiClient.fetch<AcceptFriendshipRequestDtoType['output']>(
                apiEndpoints.friendships.accept.url(input.friendId),
                { method: apiEndpoints.friendships.accept.method },
            );
        },
        ...mutationCallbacks,
        onSuccess: data => {
            toast.success('Friendship request was accepted successfully');
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
