import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import { useMutation, type MutationOptions } from '@tanstack/react-query'
import type { CreateCollectionSchema } from '../lib/schema'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import type { Collection } from '../lib/types'
import type { AxiosError } from 'axios'

type Input = CreateCollectionSchema
type CreateCollectionSuccessRes = SharedSuccessRes<Collection>
type CreateCollectionErrorRes = AxiosError<ErrorResponse>

export function useCreateCollection(
  options?: Omit<
    MutationOptions<
      CreateCollectionSuccessRes,
      CreateCollectionErrorRes,
      Input
    >,
    'MutationFn'
  >,
) {
  return useMutation({
    mutationFn: async (input) => {
      const res = await api.post<CreateCollectionSuccessRes>(
        serverEndpoints.createCollection,
        input,
      )
      return res.data
    },
    ...options,
  })
}
