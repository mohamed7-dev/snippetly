import type { SendVEmailResponseDtoType } from '@snippetly/common/dto'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { sendVToken } from '../lib/api'
import type { SendVerificationTokenSchema } from '../lib/schema'

type Input = SendVerificationTokenSchema

export function useSendVerificationToken(
  options?: Omit<
    MutateOptions<
      SendVEmailResponseDtoType['success'],
      AxiosError<SendVEmailResponseDtoType['error']>,
      Input
    >,
    'MutationFn'
  >,
) {
  return useMutation({
    mutationFn: async (input) => {
      const res = await sendVToken(input)
      return res.data
    },
    ...options,
  })
}
