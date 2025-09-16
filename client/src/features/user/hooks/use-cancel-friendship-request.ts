import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'

type Input = {
  friendName: string
}
type CancelFriendshipRequestSuccessRes = SharedSuccessRes<null>

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
