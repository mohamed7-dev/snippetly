import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { SendResetTokenSchema } from '../lib/schema'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'

type SendResetTokenSuccessRes = SharedSuccessRes<null>
type SendResetTokenErrorRes = AxiosError<ErrorResponse>
type Input = SendResetTokenSchema

export function useSendResetToken(
  options?: Omit<
    MutateOptions<SendResetTokenSuccessRes, SendResetTokenErrorRes, Input>,
    'MutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: async (input) => {
      const res = await api.put(serverEndpoints.sendResetEmail, input)
      return res.data
    },
  })
}
