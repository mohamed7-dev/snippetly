import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type DeleteAccountSuccessRes = SharedSuccessRes<null>

type DeleteAccountErrorRes = AxiosError<ErrorResponse>
export function useDeleteAccount(
  options?: Omit<
    MutationOptions<DeleteAccountSuccessRes, DeleteAccountErrorRes>,
    'mutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async () => {
      const res = await api.delete(serverEndpoints.deleteUser)
      return res.data
    },
  })
}
