import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'

type Input = {
  friendName: string
}
type RejectFriendshipRequestSuccessRes = SharedSuccessRes<null>

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
