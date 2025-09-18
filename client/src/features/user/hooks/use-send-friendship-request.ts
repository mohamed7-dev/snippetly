import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { Friendship } from '../lib/types'
import { toast } from 'sonner'

type Input = {
  friendName: string
}
type SendFriendshipRequestSuccessRes = SharedSuccessRes<
  Pick<
    Friendship,
    'addresseeId' | 'requesterId' | 'requestStatus' | 'requestSentAt'
  >
>

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
    onSuccess: (data, variables, ctx) => {
      toast.success(data.message)
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.response?.data?.message)
      options?.onError?.(error, variables, ctx)
    },
  })
}
