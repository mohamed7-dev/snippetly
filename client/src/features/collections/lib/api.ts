import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedPaginatedSuccessRes, SharedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { Collection, CollectionStats } from './types'
import type { User } from '@/features/user/lib/types'
import type { Tag } from '@/features/tags/lib/types'
import type { Snippet } from '@/features/snippets/lib/types'
import { replaceUrl } from '@/lib/utils'
import { AxiosError } from 'axios'

//################################# Shared ############################
type CreatorItem = Pick<
  User,
  'firstName' | 'username' | 'lastName' | 'fullName' | 'image'
>
type TagItem = Pick<Tag, 'name'>
type SnippetItem = Pick<Snippet, 'addedAt' | 'title' | 'publicId' | 'language'>
type CollectionItem = Pick<
  Collection,
  'title' | 'publicId' | 'color' | 'addedAt' | 'allowForking' | 'description'
> &
  Partial<Pick<Collection, 'isPrivate' | 'isForked' | 'lastUpdatedAt'>> & {
    forkedCount?: number
    snippetsCount?: number
  }

type UserCollection = CollectionItem & {
  creator: CreatorItem
  tags: TagItem[]
  snippets: SnippetItem[]
}

type Cursor = {
  updatedAt: Date
} | null
// ########################################################################

// Get Collection
type GetCollectionSuccessRes = SharedSuccessRes<UserCollection>

export const getCollectionQueryOptions = (
  slug: string,
  getRedirectionUrl?: (newSlug: string) => string,
) =>
  queryOptions({
    queryKey: ['collections', slug],
    queryFn: async () => {
      try {
        const res = await api.get<GetCollectionSuccessRes>(
          serverEndpoints.getCollection(slug),
        )
        return res.data
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.status === 308) {
            const axiosError = error as AxiosError<{ newSlug: string }>
            const responseData = axiosError.response?.data
            if (responseData && 'newSlug' in responseData) {
              !!getRedirectionUrl &&
                replaceUrl(getRedirectionUrl?.(responseData.newSlug))
            }
          }
          throw error
        }
        throw error
      }
    },
  })

// Get Current User Collections
type GetCurrentUserCollectionsSuccessRes = SharedPaginatedSuccessRes<
  Array<
    Omit<
      UserCollection,
      'isPrivate' | 'lastUpdatedAt' | 'isForked' | 'snippetsCount'
    > &
      Pick<
        UserCollection,
        'isPrivate' | 'lastUpdatedAt' | 'isForked' | 'snippetsCount'
      >
  >,
  Cursor
> & {
  stats: CollectionStats
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

type GetProfileCollectionsSuccessRes = SharedPaginatedSuccessRes<
  Array<
    Omit<UserCollection, 'snippetsCount'> &
      Pick<UserCollection, 'snippetsCount'>
  > & {
    stats: CollectionStats
  }
> & {
  stats: {
    userId: number
    totalCollections: number
    publicCollections: number
    totalSnippets: number
  }
}

export const getProfileCollectionsOptions = (
  name: string,
  getRedirectionUrl?: (newUsername: string) => string,
) =>
  infiniteQueryOptions({
    queryKey: ['collection', 'user', name],
    queryFn: async ({ pageParam }: { pageParam: Cursor | null }) => {
      try {
        const params = new URLSearchParams()
        if (pageParam) {
          params.set('cursor', JSON.stringify(pageParam))
        }
        const res = await api.get<GetProfileCollectionsSuccessRes>(
          `${serverEndpoints.getUserCollections(name)}${params ? '?' + params : ''}`,
        )
        return res.data
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.status === 308) {
            const axiosError = error as AxiosError<{ newUsername: string }>
            const responseData = axiosError.response?.data
            if (responseData && 'newUsername' in responseData) {
              !!getRedirectionUrl &&
                replaceUrl(getRedirectionUrl?.(responseData.newUsername))
            }
          }
          throw error
        }
        throw error
      }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
