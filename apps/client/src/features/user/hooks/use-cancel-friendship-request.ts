import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type {
  CancelFriendshipRequestResDtoType,
  ManageFriendshipRequestParamDtoType,
} from '@snippetly/common/dto'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type Input = ManageFriendshipRequestParamDtoType

type CancelFriendshipRequestSuccessRes =
  CancelFriendshipRequestResDtoType['success']

type CancelFriendshipRequestErrorRes = AxiosError<
  CancelFriendshipRequestResDtoType['error']
>

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
    mutationFn: async ({ friend_name }) => {
      const res = await api.put<CancelFriendshipRequestSuccessRes>(
        serverEndpoints.cancelFriendshipRequest(friend_name),
      )
      return res.data
    },
  })
}
