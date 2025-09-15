import {
  useMutation,
  useQueryClient,
  type MutationOptions,
} from '@tanstack/react-query'
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types'
import type { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

type Input = {
  slug: string
}
type DeleteSnippetSuccessRes = SharedSuccessRes<null>
type DeleteSnippetErrorRes = AxiosError<ErrorResponse>

export function useDeleteSnippet(
  options?: Omit<
    MutationOptions<DeleteSnippetSuccessRes, DeleteSnippetErrorRes, Input>,
    'mutationFn' | 'mutationKey'
  >,
) {
  const qClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    ...options,
    mutationFn: async ({ slug }) => {
      const res = await api.delete<DeleteSnippetSuccessRes>(
        serverEndpoints.deleteSnippet(slug),
      )
      return res.data
    },
    onSuccess: (data, variables, ctx) => {
      toast.success(data.message)
      qClient.removeQueries({ queryKey: ['snippets', variables.slug] })
      navigate({ to: '/dashboard/snippets' })
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message)
      options?.onError?.(error, variables, ctx)
    },
  })
}
