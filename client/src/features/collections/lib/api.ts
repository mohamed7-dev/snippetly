import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions } from '@tanstack/react-query'
import type { Collection } from './types'

type Cursor = {
  updatedAt: Date
}
type GetCurrentUserCollectionsSuccessRes = SharedSuccessRes<Collection[]> & {
  nextCursor: Cursor
}

export const getCurrentUserCollectionsOptions = infiniteQueryOptions({
  queryKey: ['collections', 'current'],
  queryFn: async ({ pageParam }: { pageParam: null | Cursor }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('limit', '20')
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserCollectionsSuccessRes>(
      `${serverEndpoints.currentUserCollections}?${searchParams}`,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
