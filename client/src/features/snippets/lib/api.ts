import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedPaginatedSuccessRes, SharedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { Snippet } from './types'
import type { Tag } from '@/features/tags/lib/types'
import type { User } from '@/features/user/lib/types'
import type { Collection } from '@/features/collections/lib/types'

// Get Snippet
type GetSnippetItem = Snippet & {
  tags: Pick<Tag, 'name'>[]
  creator: Pick<User, 'name' | 'image' | 'firstName' | 'lastName' | 'id'>
  collection: Pick<Collection, 'title' | 'slug' | 'color' | 'id'>
}
type GetSnippetSuccessRes = SharedSuccessRes<GetSnippetItem>

export const getSnippetQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['snippets', slug],
    queryFn: async () => {
      const res = await api.get<GetSnippetSuccessRes>(
        serverEndpoints.getSnippet(slug),
      )
      return res.data
    },
  })

type Cursor = {
  updatedAt: Date
} | null
// Get Snippets By Collection
type SnippetItem = Snippet & { tags: Pick<Tag, 'name'>[] }
type GetSnippetsByCollectionSuccessRes = SharedPaginatedSuccessRes<
  SnippetItem[],
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
      `${serverEndpoints.getCurrentUserSnippets}${params ? '?' + params : ''}`,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Get Profile Snippets
type GetProfileSnippet = Snippet & {
  tags: Pick<Tag, 'name'>[]
  creator: Pick<User, 'name' | 'image' | 'firstName' | 'lastName' | 'id'>
  collection: Pick<Collection, 'title' | 'slug' | 'color' | 'id'>
}
type GetProfileSnippetsSuccessRes = SharedPaginatedSuccessRes<GetProfileSnippet>

export const getProfileSnippetsOptions = (name: string) =>
  infiniteQueryOptions({
    queryKey: ['snippets', 'user', name],
    queryFn: async ({ pageParam }: { pageParam: Cursor | null }) => {
      const params = new URLSearchParams()
      if (pageParam) {
        params.set('cursor', JSON.stringify(pageParam))
      }
      const res = await api.get<GetProfileSnippetsSuccessRes>(
        `${serverEndpoints.getUserSnippets(name)}${params ? '?' + params : ''}`,
      )
      return res.data
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
