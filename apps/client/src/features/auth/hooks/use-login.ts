import type { LoginResponseDtoType } from '@snippetly/common/dto'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { login } from '../lib/api'
import type { LoginSchema } from '../lib/schema'

type Input = LoginSchema

export function useLogin(
  options?: Omit<
    MutateOptions<
      LoginResponseDtoType['success'],
      AxiosError<LoginResponseDtoType['error']>,
      Input
    >,
    'MutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async (input) => {
      const res = await login(input)
      return res.data
    },
  })
}
