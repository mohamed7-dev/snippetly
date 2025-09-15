import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedPaginatedSuccessRes, SharedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { Collection } from './types'
import type { User } from '@/features/user/lib/types'
import type { Tag } from '@/features/tags/lib/types'
import type { Snippet } from '@/features/snippets/lib/types'

// Get Collection
type CollectionItem = Collection & {
  snippets: Pick<Snippet, 'title' | 'slug' | 'language' | 'code'>[]
  tags: Pick<Tag, 'name'>[]
  creator: Pick<User, 'firstName' | 'name' | 'email' | 'lastName' | 'image'>
  snippetsCount: number
}
type GetCollectionSuccessRes = SharedSuccessRes<CollectionItem>
export const getCollectionQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['collections', slug],
    queryFn: async () => {
      const res = await api.get<GetCollectionSuccessRes>(
        serverEndpoints.getCollection(slug),
      )
      return res.data
    },
  })

// Get Current User Collections
type Cursor = {
  updatedAt: Date
}

type CollectionInList = Omit<Collection, 'snippets' | 'owner' | 'tags'> & {
  owner: Pick<User, 'id' | 'name' | 'firstName' | 'lastName' | 'email'>
  tags: Pick<Tag, 'name'>[]
  snippets: Pick<
    Snippet,
    'title' | 'slug' | 'id' | 'isPrivate' | 'allowForking' | 'language'
  >[]
  snippetsCount: number
}

type GetCurrentUserCollectionsSuccessRes = SharedPaginatedSuccessRes<
  CollectionInList[],
  Cursor
> & {
  stats: {
    totalCollections: number
    totalSnippets: number
    forkedCount: number
    publicCollections: number
  }
}

export const getCurrentUserCollectionsOptions = infiniteQueryOptions({
  queryKey: ['collections', 'current'],
  queryFn: async ({ pageParam }: { pageParam: null | Cursor }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserCollectionsSuccessRes>(
      `${serverEndpoints.getCurrentUserCollections}?${searchParams}`,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Get Profile Snippets
type GetProfileCollection = Collection & {
  tags: Pick<Tag, 'name'>[]
  creator: Pick<User, 'name' | 'image' | 'firstName' | 'lastName' | 'id'>
} & {
  snippets: Pick<Snippet, 'title' | 'slug' | 'language' | 'code' | 'id'>[]
  snippetsCount: number
}
type GetProfileCollectionsSuccessRes =
  SharedPaginatedSuccessRes<GetProfileCollection> & {
    stats: {
      userId: number
      totalCollections: number
      publicCollections: number
      totalSnippets: number
    }
  }

export const getProfileCollectionsOptions = (name: string) =>
  infiniteQueryOptions({
    queryKey: ['collection', 'user', name],
    queryFn: async ({ pageParam }: { pageParam: Cursor | null }) => {
      const params = new URLSearchParams()
      if (pageParam) {
        params.set('cursor', JSON.stringify(pageParam))
      }
      const res = await api.get<GetProfileCollectionsSuccessRes>(
        `${serverEndpoints.getUserCollections(name)}${params ? '?' + params : ''}`,
      )
      return res.data
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
