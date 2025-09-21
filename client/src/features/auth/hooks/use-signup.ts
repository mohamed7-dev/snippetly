import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { SignupSchema } from '../lib/schema'
import { serverEndpoints } from '@/lib/routes'
import type { AxiosError } from 'axios'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { api } from '@/lib/api'
import type { AuthUser } from '../lib/types'

type SignupSuccessRes = SharedSuccessRes<{
  accessToken?: string
  user?: Omit<AuthUser, 'lastUpdatedAt'>
  suggestedNames?: string[]
}>
// data exists on error object when conflict is detected
// to suggest names
type SignupErrorRes = AxiosError<ErrorResponse & { data?: string[] }>
type Input = Omit<SignupSchema, 'passwordConfirm'>

export function useSignup(
  options?: Omit<
    MutateOptions<SignupSuccessRes, SignupErrorRes, Input>,
    'MutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async (input) => {
      const res = await api.post(serverEndpoints.signup, input)
      return res.data
    },
  })
}
