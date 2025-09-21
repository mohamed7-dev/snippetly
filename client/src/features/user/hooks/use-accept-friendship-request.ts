import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { Friendship } from '../lib/types'

type Input = {
  friendName: string
}
type AcceptFriendshipRequestSuccessRes = SharedSuccessRes<
  Pick<
    Friendship,
    | 'addresseeId'
    | 'requesterId'
    | 'requestStatus'
    | 'requestSentAt'
    | 'requestAcceptedAt'
  >
>

type AcceptFriendshipRequestErrorRes = AxiosError<ErrorResponse>
export function useAcceptFriendshipRequest(
  options?: Omit<
    MutationOptions<
      AcceptFriendshipRequestSuccessRes,
      AcceptFriendshipRequestErrorRes,
      Input
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async ({ friendName }) => {
      const res = await api.put<AcceptFriendshipRequestSuccessRes>(
        serverEndpoints.acceptFriendshipRequest(friendName),
      )
      return res.data
    },
  })
}
