import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import { queryOptions } from '@tanstack/react-query'
import type { Snippet } from '@/features/snippets/lib/types'
import type { User } from '@/features/user/lib/types'
import type { Collection } from '@/features/collections/lib/types'
import type { Tag } from '@/features/tags/lib/types'

// Get Current User's Dashboard
type TagItem = Pick<Tag, 'name' | 'id'>
type SnippetItem = Pick<
  Snippet,
  | 'title'
  | 'slug'
  | 'code'
  | 'language'
  | 'id'
  | 'description'
  | 'createdAt'
  | 'isPrivate'
> & { tags: TagItem[] }

type GetCurrentUserDashboardSuccessRes = SharedSuccessRes<
  User & {
    snippets: SnippetItem[]
    collections: Pick<Collection, 'title' | 'slug' | 'id' | 'color'>[]
  }
> & {
  stats: {
    snippetsCount: number
    collectionsCount: number
    forkedSnippetsCount: number
    forkedCollectionsCount: number
    friendsCount: number
    friendsInboxCount: number
    friendsOutboxCount: number
  }
}

export const getCurrentUserDashboardOptions = queryOptions({
  queryKey: ['users', 'current', 'dashboards'],
  queryFn: async () => {
    const res = await api.get<GetCurrentUserDashboardSuccessRes>(
      serverEndpoints.getCurrentUserDashboard,
    )
    return res.data
  },
})
