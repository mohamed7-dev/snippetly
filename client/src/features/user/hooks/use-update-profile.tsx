import type { User } from '@/features/user/lib/types'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import {
  useMutation,
  useQueryClient,
  type MutationOptions,
} from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { UpdateProfileSchema } from '../lib/schema'
import { objectToFormData } from '@/lib/utils'

type Input = UpdateProfileSchema
type SendFriendshipRequestSuccessRes = SharedSuccessRes<User>
type SendFriendshipRequestErrorRes = AxiosError<ErrorResponse>

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
      const res = await api.put(serverEndpoints.updateUser, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data
    },
    onSuccess: (data, variables, ctx) => {
      qClient.invalidateQueries({ queryKey: ['users', 'profiles', 'current'] })
      options?.onSuccess?.(data, variables, ctx)
    },
  })
}
