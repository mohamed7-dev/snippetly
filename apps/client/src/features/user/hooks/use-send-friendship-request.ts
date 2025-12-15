import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type {
  ManageFriendshipRequestParamDtoType,
  SendFriendshipRequestResDtoType,
} from '@snippetly/common/dto'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type Input = ManageFriendshipRequestParamDtoType

type SendFriendshipRequestSuccessRes =
  SendFriendshipRequestResDtoType['success']

type SendFriendshipRequestErrorRes = AxiosError<
  SendFriendshipRequestResDtoType['error']
>
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
    mutationFn: async ({ friend_name }) => {
      const res = await api.put<SendFriendshipRequestSuccessRes>(
        serverEndpoints.sendFriendshipRequest(friend_name),
      )
      return res.data
    },
  })
}
