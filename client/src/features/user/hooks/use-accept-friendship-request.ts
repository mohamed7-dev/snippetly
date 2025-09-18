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
