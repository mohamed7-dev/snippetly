import {
  useMutation,
  useMutationState,
  type MutationOptions,
} from '@tanstack/react-query'
import type { CreateSnippetSchema } from '../lib/schema'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import type { Snippet } from '../lib/types'
import type { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'

type Input = CreateSnippetSchema
type CreateSnippetSuccessRes = SharedSuccessRes<Snippet>
type CreateSnippetErrorRes = AxiosError<ErrorResponse>

export function useCreateSnippet(
  options?: Omit<
    MutationOptions<CreateSnippetSuccessRes, CreateSnippetErrorRes, Input>,
    'mutationFn' | 'mutationKey'
  >,
) {
  return useMutation({
    mutationKey: ['create-snippet'],
    mutationFn: async (input) => {
      const res = await api.post<CreateSnippetSuccessRes>(
        serverEndpoints.createSnippet,
        input,
      )
      return res.data
    },
    ...options,
  })
}

export function useGetCreateSnippetMutationState() {
  return useMutationState({
    filters: { mutationKey: ['create-snippet'] },
    select: (mutation) => mutation.state,
  })
}
