import type { SignupResponseDtoType } from '@snippetly/common/dto'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { signup } from '../lib/api'
import type { SignupSchema } from '../lib/schema'

type Input = Omit<SignupSchema, 'passwordConfirm'>

export function useSignup(
  options?: Omit<
    MutateOptions<
      SignupResponseDtoType['success'],
      AxiosError<
        SignupResponseDtoType['error'] | SignupResponseDtoType['conflict']
      >,
      Input
    >,
    'MutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async (input) => {
      const res = await signup(input)
      return res.data
    },
  })
}
