import {
  useMutation,
  useMutationState,
  type MutationOptions,
} from '@tanstack/react-query'
import type { EditSnippetSchema } from '../lib/schema'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import type { Snippet } from '../lib/types'
import type { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'

type Input = {
  data: EditSnippetSchema
  slug: string
}
type UpdateSnippetSuccessRes = SharedSuccessRes<Snippet>
type UpdateSnippetErrorRes = AxiosError<ErrorResponse>

export function useUpdateSnippet(
  options?: Omit<
    MutationOptions<UpdateSnippetSuccessRes, UpdateSnippetErrorRes, Input>,
    'mutationFn' | 'mutationKey'
  >,
) {
  return useMutation({
    mutationKey: ['update-snippet'],
    mutationFn: async ({ slug, data }) => {
      const res = await api.put<UpdateSnippetSuccessRes>(
        serverEndpoints.updateSnippet(slug),
        data,
      )
      return res.data
    },
    ...options,
  })
}

export function useGetUpdateSnippetMutationState() {
  return useMutationState({
    filters: { mutationKey: ['update-snippet'] },
    select: (mutation) => mutation.state,
  })
}
