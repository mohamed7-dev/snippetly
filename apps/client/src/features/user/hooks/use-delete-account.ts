import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { DeleteUserResponseDtoType } from '@snippetly/common/dto'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type DeleteAccountSuccessRes = DeleteUserResponseDtoType['success']

type DeleteAccountErrorRes = AxiosError<DeleteUserResponseDtoType['error']>
export function useDeleteAccount(
  options?: Omit<
    MutationOptions<DeleteAccountSuccessRes, DeleteAccountErrorRes>,
    'mutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async () => {
      const res = await api.delete<DeleteAccountSuccessRes>(
        serverEndpoints.deleteUser,
      )
      return res.data
    },
  })
}
