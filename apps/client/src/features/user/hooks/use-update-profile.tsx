import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import { objectToFormData } from '@/lib/utils'
import type {
  UpdateUserRequestDtoType,
  UpdateUserResponseDtoType,
} from '@snippetly/common/dto'
import {
  useMutation,
  useQueryClient,
  type MutationOptions,
} from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type Input = UpdateUserRequestDtoType
type SendFriendshipRequestSuccessRes = UpdateUserResponseDtoType['success']
type SendFriendshipRequestErrorRes = AxiosError<
  UpdateUserResponseDtoType['error']
>

export function useUpdateProfile(
  options?: Omit<
    MutationOptions<
      SendFriendshipRequestSuccessRes,
      SendFriendshipRequestErrorRes,
      Input
    >,
    'mutationFn'
  >,
) {
  const qClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: async (input) => {
      const formData = objectToFormData(input)
      const res = await api.patch(serverEndpoints.updateUser, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data
    },
    onSuccess: (data, variables, onMutateResult, ctx) => {
      qClient.invalidateQueries({ queryKey: ['users', 'profiles', 'current'] })
      options?.onSuccess?.(data, variables, onMutateResult, ctx)
    },
  })
}
