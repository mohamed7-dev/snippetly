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
  return useMutation({
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
  })
}
