import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import { queryOptions } from '@tanstack/react-query'
import type { Snippet } from '@/features/snippets/lib/types'
import type { User, UserActivityStats } from '@/features/user/lib/types'
import type { Collection } from '@/features/collections/lib/types'
import type { Tag } from '@/features/tags/lib/types'

type TagItem = Pick<Tag, 'name'>
type SnippetItem = Pick<
  Snippet,
  | 'title'
  | 'publicId'
  | 'code'
  | 'language'
  | 'description'
  | 'addedAt'
  | 'lastUpdatedAt'
  | 'isPrivate'
> & { tags: TagItem[] }

type CollectionItem = Pick<
  Collection,
  'title' | 'publicId' | 'color' | 'addedAt' | 'lastUpdatedAt'
> & { snippetsCount: number }
type GetCurrentUserDashboardSuccessRes = SharedSuccessRes<{
  profile: Pick<
    User,
    | 'username'
    | 'fullName'
    | 'firstName'
    | 'lastName'
    | 'joinedAt'
    | 'lastUpdatedAt'
    | 'isPrivate'
    | 'email'
    | 'bio'
    | 'image'
    | 'acceptedPolicies'
    | 'emailVerifiedAt'
  >
  stats: UserActivityStats
  recentSnippets: SnippetItem[]
  recentCollections: CollectionItem[]
}>

export const getCurrentUserDashboardOptions = queryOptions({
  queryKey: ['users', 'current', 'dashboard'],
  queryFn: async () => {
    const res = await api.get<GetCurrentUserDashboardSuccessRes>(
      serverEndpoints.getCurrentUserDashboard,
    )
    return res.data
  },
})
