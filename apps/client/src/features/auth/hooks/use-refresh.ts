import type { RefreshTokenResponseDtoType } from '@snippetly/common/dto'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useAuth } from '../components/auth-provider'
import { refreshAccessToken } from '../lib/api'
import { authStore } from '../lib/auth-store'

export function useRefresh(
  options?: Omit<
    MutateOptions<
      RefreshTokenResponseDtoType['success'],
      AxiosError<RefreshTokenResponseDtoType['error']>
    >,
    'MutationFn'
  >,
) {
  const ctx = useAuth()
  return useMutation({
    ...options,
    mutationFn: async () => {
      const res = await refreshAccessToken()
      return res.data
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      ctx?.updateAccessToken(data.data.accessToken)
      authStore.setAccessToken(data.data.accessToken)
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    onError: (error, variables, onMutateResult, context) => {
      options?.onError?.(error, variables, onMutateResult, context)
    },
  })
}
