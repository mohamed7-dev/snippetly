import type { Collection } from '@/features/collections/lib/types'
import type { Snippet } from '@/features/snippets/lib/types'
import type { Tag } from '@/features/tags/lib/types'
import type { User } from '@/features/user/lib/types'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedPaginatedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions } from '@tanstack/react-query'

type Cursor = {
  snippetsCount: number
  id: number
} | null
type UserItem = Pick<
  User,
  'username' | 'bio' | 'firstName' | 'lastName' | 'fullName' | 'email' | 'image'
> & {
  snippetsCount: number
  friendsCount: number
  recentTags: Pick<Tag, 'name'>[]
}

type DiscoverUsersSuccessRes = SharedPaginatedSuccessRes<UserItem[], Cursor>

export const discoverUsersQueryOptions = infiniteQueryOptions({
  queryKey: ['discover', 'users'],
  queryFn: async ({ pageParam }: { pageParam: Cursor }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<DiscoverUsersSuccessRes>(
      `${serverEndpoints.discoverUsers}?${searchParams}`,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Discover snippets
type SnippetsCursor = {
  updatedAt: Date
}
type SnippetItem = Pick<
  Snippet,
  | 'publicId'
  | 'title'
  | 'language'
  | 'code'
  | 'addedAt'
  | 'description'
  | 'allowForking'
> & {
  forkedCount: number
  creator: Pick<
    User,
    'username' | 'firstName' | 'lastName' | 'fullName' | 'image'
  >
  collection: Pick<Collection, 'title' | 'publicId' | 'color'>
  tags: Pick<Tag, 'name'>[]
}
type DiscoverSnippetsSuccessRes = SharedPaginatedSuccessRes<
  SnippetItem[],
  SnippetsCursor
>

export const discoverSnippetsQueryOptions = infiniteQueryOptions({
  queryKey: ['discover', 'snippets'],
  queryFn: async ({ pageParam }: { pageParam: SnippetsCursor | null }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<DiscoverSnippetsSuccessRes>(
      `${serverEndpoints.discoverSnippets}?${searchParams}`,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
