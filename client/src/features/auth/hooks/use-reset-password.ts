import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ResetPasswordSchema } from '../lib/schema'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'

type ResetPasswordSuccessRes = SharedSuccessRes<null>
type ResetPasswordErrorRes = AxiosError<ErrorResponse>
type Input = ResetPasswordSchema

export function useResetPassword(
  options?: Omit<
    MutateOptions<ResetPasswordSuccessRes, ResetPasswordErrorRes, Input>,
    'MutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async ({ password, token }) => {
      const searchParams = new URLSearchParams()
      searchParams.set('token', token)
      const res = await api.put(
        `${serverEndpoints.resetPassword}?${searchParams.toString()}`,
        { password },
      )
      return res.data
    },
  })
}
