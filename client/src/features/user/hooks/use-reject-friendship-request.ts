import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { Friendship } from '../lib/types'

type Input = {
  friendName: string
}
type RejectFriendshipRequestSuccessRes = SharedSuccessRes<
  Pick<
    Friendship,
    | 'addresseeId'
    | 'requesterId'
    | 'requestStatus'
    | 'requestSentAt'
    | 'requestRejectedAt'
  >
>

type RejectFriendshipRequestErrorRes = AxiosError<ErrorResponse>
export function useRejectFriendshipRequest(
  options?: Omit<
    MutationOptions<
      RejectFriendshipRequestSuccessRes,
      RejectFriendshipRequestErrorRes,
      Input
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async ({ friendName }) => {
      const res = await api.put<RejectFriendshipRequestSuccessRes>(
        serverEndpoints.rejectFriendshipRequest(friendName),
      )
      return res.data
    },
  })
}
