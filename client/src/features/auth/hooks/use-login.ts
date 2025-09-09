import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { LoginSchema } from '../lib/schema'
import { serverEndpoints } from '@/lib/routes'
import type { AxiosError } from 'axios'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import type { User } from '@/features/user'
import { api } from '@/lib/api'

type LoginSuccessRes = SharedSuccessRes<{ accessToken: string; user: User }>
type LoginErrorRes = AxiosError<ErrorResponse>
type Input = LoginSchema

export function useLogin(
  options?: Omit<
    MutateOptions<LoginSuccessRes, LoginErrorRes, Input>,
    'MutationFn'
  >,
) {
  return useMutation({
    mutationFn: async (input) => {
      const res = await api.put<LoginSuccessRes>(serverEndpoints.login, input)
      return res.data
    },
    ...options,
  })
}
