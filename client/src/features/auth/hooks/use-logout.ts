import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

type LogoutSuccessRes = SharedSuccessRes<null>
type LoginErrorRes = AxiosError<ErrorResponse>

export function useLogout(
  options?: Omit<MutateOptions<LogoutSuccessRes, LoginErrorRes>, 'MutationFn'>,
) {
  return useMutation({
    mutationFn: async () => {
      const res = await api.put<LogoutSuccessRes>(serverEndpoints.logout)
      return res.data
    },
    ...options,
  })
}
