import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import type { Collection } from '../lib/types'
import {
  useMutation,
  useQueryClient,
  type MutationOptions,
} from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useNavigate } from '@tanstack/react-router'

type Input = {
  slug: string
}
export type ForkCollectionSuccessRes = SharedSuccessRes<Collection>
export type ForkCollectionErrorRes = AxiosError<ErrorResponse>

export function useForkCollection(
  options?: Omit<
    MutationOptions<ForkCollectionSuccessRes, ForkCollectionErrorRes, Input>,
    'mutationFn' | 'mutationKey'
  >,
) {
  const qClient = useQueryClient()
  const ctx = useAuth()
  const navigate = useNavigate()
  const fork = useMutation({
    ...options,
    mutationFn: async ({ slug }) => {
      const res = await api.put(serverEndpoints.forkCollection(slug))
      return res.data
    },
    onSuccess: (data, variables, ctx) => {
      qClient.invalidateQueries({
        queryKey: ['collections', 'current'],
      })
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (e, variables, ctx) => {
      if (e.status === 401)
        navigate({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      options?.onError?.(e, variables, ctx)
    },
  })

  const onClick = (input?: Input) => {
    if (!ctx.isAuthenticated) {
      navigate({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
      return
    }
    if (input) {
      fork.mutate(input)
    }
  }
  const isPending = fork.isPending

  return {
    onClick,
    isPending,
  }
}
