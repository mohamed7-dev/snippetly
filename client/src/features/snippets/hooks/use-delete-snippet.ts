import {
  useMutation,
  useQueryClient,
  type MutationOptions,
} from '@tanstack/react-query'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import type { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'

type Input = {
  slug: string
}
export type DeleteSnippetSuccessRes = SharedSuccessRes<null>
export type DeleteSnippetErrorRes = AxiosError<ErrorResponse>

export function useDeleteSnippet(
  options?: Omit<
    MutationOptions<DeleteSnippetSuccessRes, DeleteSnippetErrorRes, Input>,
    'mutationFn' | 'mutationKey'
  >,
) {
  const qClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: async ({ slug }) => {
      const res = await api.delete<DeleteSnippetSuccessRes>(
        serverEndpoints.deleteSnippet(slug),
      )
      return res.data
    },
    onSuccess: (data, variables, ctx) => {
      qClient.removeQueries({ queryKey: ['snippets', variables.slug] })
      qClient.invalidateQueries({ queryKey: ['snippets', 'current'] })
      options?.onSuccess?.(data, variables, ctx)
    },
  })
}
