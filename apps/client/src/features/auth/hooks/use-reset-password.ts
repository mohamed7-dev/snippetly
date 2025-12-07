import type { VerifyRTokenResponseDtoType } from '@snippetly/common/dto'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { resetPassword } from '../lib/api'
import type { ResetPasswordSchema } from '../lib/schema'

type Input = ResetPasswordSchema

export function useResetPassword(
  options?: Omit<
    MutateOptions<
      VerifyRTokenResponseDtoType['success'],
      AxiosError<VerifyRTokenResponseDtoType['error']>,
      Input
    >,
    'MutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async ({ password, token }) => {
      const searchParams = new URLSearchParams()
      searchParams.set('token', token)
      const res = await resetPassword(searchParams.toString(), { password })
      return res.data
    },
  })
}
