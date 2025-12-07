import type { LogoutResponseDtoType } from '@snippetly/common/dto'
import {
  useMutation,
  useQueryClient,
  type MutateOptions,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useAuth } from '../components/auth-provider'
import { logout } from '../lib/api'

export function useLogout(
  options?: Omit<
    MutateOptions<
      LogoutResponseDtoType['success'],
      AxiosError<LogoutResponseDtoType['error']>
    >,
    'MutationFn'
  >,
) {
  const { logout: logoutOnClient } = useAuth()
  const navigate = useNavigate()
  const qClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: async () => {
      const res = await logout()
      return res.data
    },
    onSuccess: (data, variables, onMutateResult, ctx) => {
      toast.success(data.message)
      navigate({ to: '/' })
      logoutOnClient()
      qClient.removeQueries()
      options?.onSuccess?.(data, variables, onMutateResult, ctx)
    },
    onError: (error, variables, onMutateResult, ctx) => {
      toast.error(error.response?.data.message)
      options?.onError?.(error, variables, onMutateResult, ctx)
    },
  })
}
