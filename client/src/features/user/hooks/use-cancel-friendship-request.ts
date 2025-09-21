import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { Friendship } from '../lib/types'

type Input = {
  friendName: string
}
type CancelFriendshipRequestSuccessRes = SharedSuccessRes<
  Pick<
    Friendship,
    | 'addresseeId'
    | 'requesterId'
    | 'requestStatus'
    | 'requestSentAt'
    | 'requestCancelledAt'
  >
>

type CancelFriendshipRequestErrorRes = AxiosError<ErrorResponse>
export function useCancelFriendshipRequest(
  options?: Omit<
    MutationOptions<
      CancelFriendshipRequestSuccessRes,
      CancelFriendshipRequestErrorRes,
      Input
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async ({ friendName }) => {
      const res = await api.put<CancelFriendshipRequestSuccessRes>(
        serverEndpoints.cancelFriendshipRequest(friendName),
      )
      return res.data
    },
  })
}
