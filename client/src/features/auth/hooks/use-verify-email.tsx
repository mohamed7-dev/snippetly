import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { VerifyEmailSchema } from '../lib/schema'

type VerifyEmailSuccessRes = SharedSuccessRes<{}>
type VerifyEmailErrorRes = AxiosError<ErrorResponse>
type Input = VerifyEmailSchema

export function useVerifyEmail(
  options?: Omit<
    MutateOptions<VerifyEmailSuccessRes, VerifyEmailErrorRes, Input>,
    'MutationFn'
  >,
) {
  return useMutation({
    mutationFn: async (input) => {
      const searchParams = new URLSearchParams()
      searchParams.set('token', input.token)
      const res = await api.put<VerifyEmailSuccessRes>(
        serverEndpoints.verifyEmailToken + '?' + searchParams.toString(),
        input,
      )
      return res.data
    },
    ...options,
  })
}
