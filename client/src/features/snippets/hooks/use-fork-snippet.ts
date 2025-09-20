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
  return useMutation({
    ...options,
    mutationKey: ['fork-snippet'],
    mutationFn: async ({ slug, collectionSlug }) => {
      const res = await api.put(serverEndpoints.forkSnippet(slug), {
        collection: collectionSlug,
      })
      return res.data
    },
    onSuccess: (data, variables, ctx) => {
      qClient.invalidateQueries({ queryKey: ['snippets', 'current'] })
      options?.onSuccess?.(data, variables, ctx)
    },
  })
}

export function useGetUpdateSnippetMutationState() {
  return useMutationState({
    filters: { mutationKey: ['fork-snippet'] },
    select: (mutation) => mutation.state,
  })
}
