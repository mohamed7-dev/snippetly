import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedPaginatedSuccessRes, SharedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { Snippet } from './types'
import type { Tag } from '@/features/tags/lib/types'
import type { User } from '@/features/user/lib/types'
import type { Collection } from '@/features/collections/lib/types'
import { replaceUrl } from '@/lib/utils'

//###################### Shared ################################
type CollectionItem = Pick<Collection, 'title' | 'publicId' | 'color'>
type CreatorItem = Pick<
  User,
  'username' | 'image' | 'firstName' | 'lastName' | 'fullName'
>
type TagItem = Pick<Tag, 'name'>
type SnippetItem = Pick<
  Snippet,
  | 'title'
  | 'publicId'
  | 'language'
  | 'code'
  | 'addedAt'
  | 'allowForking'
  | 'description'
> &
  Partial<Pick<Snippet, 'isPrivate' | 'lastUpdatedAt' | 'isForked'>> & {
    forkedCount: number
  }

type UserSnippet = SnippetItem & {
  tags: TagItem[]
  creator: CreatorItem
  collection: CollectionItem
}
type Cursor = {
  updatedAt: Date
} | null
// ################################################################

// Get Snippet
type GetSnippetSuccessRes = SharedSuccessRes<
  UserSnippet & Pick<Snippet, 'note'>
>

export const getSnippetQueryOptions = (
  slug: string,
  shouldReplaceUrl?: boolean,
  newUrl?: (newSlug: string) => string,
) =>
  queryOptions({
    queryKey: ['snippets', slug],
    queryFn: async () => {
      const res = await api.get<GetSnippetSuccessRes>(
        serverEndpoints.getSnippet(slug),
      )
      if (
        shouldReplaceUrl &&
        newUrl &&
        (res.request as XMLHttpRequest).responseURL
      ) {
        const url = (res.request as XMLHttpRequest).responseURL
        const newSlug = url.split('/').at(-1)
        !!newSlug && replaceUrl(newUrl(newSlug))
      }
      return res.data
    },
  })

// Get Snippets By Collection
type GetSnippetsByCollectionSuccessRes = SharedPaginatedSuccessRes<
  {
    snippets: Array<
      Omit<UserSnippet, 'isPrivate'> & Required<Pick<UserSnippet, 'isPrivate'>>
    >
    collection: CollectionItem
  },
  Cursor
>
export const getSnippetsByCollectionOptions = (slug: string) =>
  infiniteQueryOptions({
    queryKey: ['snippets', 'collection', slug],
    queryFn: async ({ pageParam }: { pageParam: Cursor }) => {
      const params = new URLSearchParams()
      if (pageParam) {
        params.set('cursor', JSON.stringify(pageParam))
      }
      const res = await api.get<GetSnippetsByCollectionSuccessRes>(
        `${serverEndpoints.getSnippetsByCollection(slug)}${params ? '?' + params : ''}`,
      )
      return res.data
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

// Get Current User Snippets
type GetCurrentSnippetsSuccessRes = SharedPaginatedSuccessRes<
  Array<
    Omit<UserSnippet, 'isPrivate' | 'lastUpdated'> &
      Pick<Snippet, 'isPrivate' | 'lastUpdatedAt'>
  >,
  Cursor
>
export const getCurrentSnippetsOptions = infiniteQueryOptions({
  queryKey: ['snippets', 'current'],
  queryFn: async ({ pageParam }: { pageParam: Cursor }) => {
    const params = new URLSearchParams()
    if (pageParam) {
      params.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentSnippetsSuccessRes>(
      `${serverEndpoints.getCurrentUserSnippets}${params ? '?' + params : ''}`,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Get Profile Snippets
type GetUserSnippetsSuccessRes = SharedPaginatedSuccessRes<
  Array<UserSnippet>,
  Cursor
>

export const getUserSnippetsOptions = (name: string) =>
  infiniteQueryOptions({
    queryKey: ['snippets', 'user', name],
    queryFn: async ({ pageParam }: { pageParam: Cursor | null }) => {
      const params = new URLSearchParams()
      if (pageParam) {
        params.set('cursor', JSON.stringify(pageParam))
      }
      const res = await api.get<GetUserSnippetsSuccessRes>(
        `${serverEndpoints.getUserSnippets(name)}${params ? '?' + params : ''}`,
      )
      return res.data
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
