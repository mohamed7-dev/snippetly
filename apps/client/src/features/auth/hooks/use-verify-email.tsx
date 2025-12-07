import type { VerifyVTokenResponseDtoType } from '@snippetly/common/dto'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { verifyVToken } from '../lib/api'
import type { VerifyEmailSchema } from '../lib/schema'

type Input = VerifyEmailSchema

export function useVerifyEmail(
  options?: Omit<
    MutateOptions<
      VerifyVTokenResponseDtoType['success'],
      AxiosError<VerifyVTokenResponseDtoType['error']>,
      Input
    >,
    'MutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async (input) => {
      const searchParams = new URLSearchParams()
      searchParams.set('token', input.token)
      const res = await verifyVToken(searchParams.toString(), input)
      return res.data
    },
  })
}
