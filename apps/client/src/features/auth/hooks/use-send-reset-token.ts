import type { SendRTokenResponseDtoType } from '@snippetly/common/dto'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { sendRToken } from '../lib/api'
import type { SendResetTokenSchema } from '../lib/schema'

type Input = SendResetTokenSchema

export function useSendResetToken(
  options?: Omit<
    MutateOptions<
      SendRTokenResponseDtoType['success'],
      AxiosError<SendRTokenResponseDtoType['error']>,
      Input
    >,
    'MutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async (input) => {
      const res = await sendRToken(input)
      return res.data
    },
  })
}
