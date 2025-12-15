import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type {
  AcceptFriendshipRequestResDtoType,
  ManageFriendshipRequestParamDtoType,
} from '@snippetly/common/dto'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type Input = ManageFriendshipRequestParamDtoType

type AcceptFriendshipRequestSuccessRes =
  AcceptFriendshipRequestResDtoType['success']

type AcceptFriendshipRequestErrorRes = AxiosError<
  AcceptFriendshipRequestResDtoType['error']
>
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
    mutationFn: async ({ friend_name }) => {
      const res = await api.put<AcceptFriendshipRequestSuccessRes>(
        serverEndpoints.acceptFriendshipRequest(friend_name),
      )
      return res.data
    },
  })
}
