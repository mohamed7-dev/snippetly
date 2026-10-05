import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { CancelFriendshipRequestDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type CancelFriendshipRequestMutationCallbacks = AsyncActionCallback<
    ApiSuccess<CancelFriendshipRequestDtoType['output']>,
    ApiClientError
>;

export function useCancelFriendshipRequest(mutationCallbacks?: CancelFriendshipRequestMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: CancelFriendshipRequestDtoType['input']) => {
            return await developerApiClient.fetch<CancelFriendshipRequestDtoType['output']>(
                apiEndpoints.friendships.cancel.url(input.friendId),
                { method: apiEndpoints.friendships.cancel.method },
            );
        },
        ...mutationCallbacks,
        onSuccess: data => {
            toast.success('Friendship request was cancelled successfully');
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
