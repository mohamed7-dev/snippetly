import type { ErrorResponse } from '@/lib/types'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { refreshAccessToken } from '../lib/api'
import { useAuth } from '../components/auth-provider'
import { authStore } from '../lib/auth-store'

type RefreshSuccessRes = Awaited<ReturnType<typeof refreshAccessToken>>['data']
type LoginErrorRes = AxiosError<ErrorResponse>

export function useRefresh(
  options?: Omit<MutateOptions<RefreshSuccessRes, LoginErrorRes>, 'MutationFn'>,
) {
  const ctx = useAuth()
  return useMutation({
    ...options,
    mutationFn: async () => {
      const res = await refreshAccessToken()
      return res.data
    },
    onSuccess: (data, variables, context) => {
      ctx?.updateAccessToken(data.data.accessToken)
      authStore.setAccessToken(data.data.accessToken)
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      console.log(error)
      options?.onError?.(error, variables, context)
    },
  })
}
