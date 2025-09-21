import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import { useMutation, type MutateOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useAuth } from '../components/auth-provider'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

type LogoutSuccessRes = SharedSuccessRes<null>
type LoginErrorRes = AxiosError<ErrorResponse>

export function useLogout(
  options?: Omit<MutateOptions<LogoutSuccessRes, LoginErrorRes>, 'MutationFn'>,
) {
  const { logout: logoutOnClient } = useAuth()
  const navigate = useNavigate()
  return useMutation({
    ...options,
    mutationFn: async () => {
      const res = await api.put<LogoutSuccessRes>(serverEndpoints.logout)
      return res.data
    },
    onSuccess: (data, variables, ctx) => {
      toast.success(data.message)
      navigate({ to: '/' })
      logoutOnClient()
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.response?.data.message)
      options?.onError?.(error, variables, ctx)
    },
  })
}
