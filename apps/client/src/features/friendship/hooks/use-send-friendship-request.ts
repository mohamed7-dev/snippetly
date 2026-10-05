import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { SendFriendshipRequestDtoType } from '@snippetly/common/dto';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type SendFriendshipRequestMutationCallbacks = AsyncActionCallback<
    ApiSuccess<SendFriendshipRequestDtoType['output']>,
    ApiClientError
>;

export function useSendFriendshipRequest(mutationCallbacks?: SendFriendshipRequestMutationCallbacks) {
    return useMutation({
        mutationFn: async (input: SendFriendshipRequestDtoType['input']) => {
            return await developerApiClient.fetch<SendFriendshipRequestDtoType['output']>(
                apiEndpoints.friendships.request.url(input.friendId),
                { method: apiEndpoints.friendships.request.method },
            );
        },
        ...mutationCallbacks,
        onSuccess: data => {
            toast.success('Friendship request was sent successfully');
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
