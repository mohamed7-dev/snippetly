import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions } from '@tanstack/react-query'
import type { Snippet } from './types'

type Cursor = {
  updatedAt: Date
} | null

type GetCurrentSnippetsSuccessRes = SharedSuccessRes<Snippet[]> & {
  nextCursor: Cursor
}

export const getCurrentSnippetsOptions = infiniteQueryOptions({
  queryKey: ['snippets', 'current'],
  queryFn: async ({ pageParam }: { pageParam: Cursor }) => {
    const params = new URLSearchParams()
    if (pageParam) {
      params.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentSnippetsSuccessRes>(
      `${serverEndpoints.currentUserSnippets}${params ? '?' + params : ''}`,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
