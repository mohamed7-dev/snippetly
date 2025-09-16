import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type Input = {
  friendName: string
}
type SendFriendshipRequestSuccessRes = SharedSuccessRes<null>

type SendFriendshipRequestErrorRes = AxiosError<ErrorResponse>
export function useSendFriendshipRequest(
  options?: Omit<
    MutationOptions<
      SendFriendshipRequestSuccessRes,
      SendFriendshipRequestErrorRes,
      Input
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async ({ friendName }) => {
      const res = await api.put<SendFriendshipRequestSuccessRes>(
        serverEndpoints.sendFriendshipRequest(friendName),
      )
      return res.data
    },
  })
}
