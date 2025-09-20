import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { SendVerificationTokenSchema } from '../lib/schema'

type SendVTokenSuccessRes = SharedSuccessRes<null>
type SendVTokenErrorRes = AxiosError<ErrorResponse>
type Input = SendVerificationTokenSchema

export function useSendVerificationToken(
  options?: Omit<
    MutateOptions<SendVTokenSuccessRes, SendVTokenErrorRes, Input>,
    'MutationFn'
  >,
) {
  return useMutation({
    mutationFn: async (input) => {
      const res = await api.put(serverEndpoints.sendVerificationEmail, input)
      return res.data
    },
    ...options,
  })
}
