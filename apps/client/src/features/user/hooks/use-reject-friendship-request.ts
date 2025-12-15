import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type {
  ManageFriendshipRequestParamDtoType,
  RejectFriendshipRequestResDtoType,
} from '@snippetly/common/dto'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type Input = ManageFriendshipRequestParamDtoType
type RejectFriendshipRequestSuccessRes =
  RejectFriendshipRequestResDtoType['success']

type RejectFriendshipRequestErrorRes = AxiosError<
  RejectFriendshipRequestResDtoType['error']
>

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
    mutationFn: async ({ friend_name }) => {
      const res = await api.put<RejectFriendshipRequestSuccessRes>(
        serverEndpoints.rejectFriendshipRequest(friend_name),
      )
      return res.data
    },
  })
}
