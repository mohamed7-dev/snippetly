import {
  useMutation,
  useMutationState,
  useQueryClient,
  type MutationOptions,
} from '@tanstack/react-query'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import type { Snippet } from '../lib/types'
import type { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useNavigate } from '@tanstack/react-router'
import { authStore } from '@/features/auth/lib/auth-store'
import { getCurrentSnippetsOptions } from '../lib/api'

type Input = {
  slug: string
  collectionSlug: string
}

export type ForkSnippetSuccessRes = SharedSuccessRes<
  Omit<Snippet, 'forkedFrom'> & {
    isForked: boolean
    collectionPublicId: string
    creatorName: string
  }
>
export type ForkSnippetErrorRes = AxiosError<ErrorResponse>

export function useForkSnippet(
  options?: Omit<
    MutationOptions<ForkSnippetSuccessRes, ForkSnippetErrorRes, Input>,
    'mutationFn' | 'mutationKey'
  >,
) {
  const qClient = useQueryClient()
  const ctx = useAuth()
  const navigate = useNavigate()
  const fork = useMutation({
    ...options,
    mutationKey: ['fork-snippet'],
    mutationFn: async ({ slug, collectionSlug }) => {
      const res = await api.put(serverEndpoints.forkSnippet(slug), {
        collection: collectionSlug,
      })
      return res.data
    },
    onSuccess: (data, variables, ctx) => {
      qClient.invalidateQueries(getCurrentSnippetsOptions)
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
    if (
      (!ctx.isAuthenticated || ctx.isLoggedOut) &&
      !authStore.getAccessToken()
    ) {
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

  return { onClick, isPending }
}

export function useGetUpdateSnippetMutationState() {
  return useMutationState({
    filters: { mutationKey: ['fork-snippet'] },
    select: (mutation) => mutation.state,
  })
}
