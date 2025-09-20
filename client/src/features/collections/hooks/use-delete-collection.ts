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
export type DeleteCollectionSuccessRes = SharedSuccessRes<null>
export type DeleteCollectionErrorRes = AxiosError<ErrorResponse>

export function useDeleteCollection(
  options?: Omit<
    MutationOptions<
      DeleteCollectionSuccessRes,
      DeleteCollectionErrorRes,
      Input
    >,
    'mutationFn' | 'mutationKey'
  >,
) {
  const qClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: async ({ slug }) => {
      const res = await api.delete<DeleteCollectionSuccessRes>(
        serverEndpoints.deleteCollection(slug),
      )
      return res.data
    },
    onSuccess: (data, variables, ctx) => {
      qClient.removeQueries({ queryKey: ['collections', variables.slug] })
      options?.onSuccess?.(data, variables, ctx)
    },
  })
}
