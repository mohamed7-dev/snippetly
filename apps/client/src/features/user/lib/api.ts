import type { Collection } from '@/features/collections/lib/types'
import type { Snippet } from '@/features/snippets/lib/types'
import type { Tag } from '@/features/tags/lib/types'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedPaginatedSuccessRes } from '@/lib/types'
import type {
  GetCurrentUserFriendsRequestQueryDtoType,
  GetCurrentUserFriendsResDtoType,
  GetCurrentUserInboxResDtoType,
  GetCurrentUserOutboxResDtoType,
  GetCurrentUserResponseDtoType,
  GetUserResponseDtoType,
} from '@snippetly/common/dto'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { User } from './types'

// Get User Profile
export const getUserProfile = (name: string) =>
  queryOptions({
    queryKey: ['users', 'profiles', name],
    queryFn: async () => {
      const res = await api.get<GetUserResponseDtoType['success']>(
        serverEndpoints.getUserProfile(name),
      )
      return res.data
    },
  })

// get current user profile
export const getCurrentUserProfileOptions = queryOptions({
  queryKey: ['users', 'profiles', 'current'],
  queryFn: async () => {
    const res = await api.get<GetCurrentUserResponseDtoType['success']>(
      serverEndpoints.getCurrentUserProfile,
    )
    return res.data
  },
})

// ######################### Shared Types #######################
type Cursor = {
  id: number
}

// Get Current User Inbox
type GetCurrentUserInboxSuccessRes = GetCurrentUserInboxResDtoType['success']
export const getCurrentUserInbox = infiniteQueryOptions({
  queryKey: ['users', 'current', 'inbox'],
  queryFn: async ({
    pageParam,
  }: {
    pageParam: GetCurrentUserFriendsRequestQueryDtoType['cursor']
  }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserInboxSuccessRes>(
      serverEndpoints.getCurrentUserInbox,
    )
    return res.data
  },
  initialPageParam: undefined,
  getNextPageParam: (lastPage) => lastPage.data.nextCursor,
})

// Get Current User Outbox
type GetCurrentUserOutboxSuccessRes = GetCurrentUserOutboxResDtoType['success']
export const getCurrentUserOutbox = infiniteQueryOptions({
  queryKey: ['users', 'current', 'outbox'],
  queryFn: async ({
    pageParam,
  }: {
    pageParam: GetCurrentUserFriendsRequestQueryDtoType['cursor']
  }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserOutboxSuccessRes>(
      serverEndpoints.getCurrentUserOutbox,
    )
    return res.data
  },
  initialPageParam: undefined,
  getNextPageParam: (lastPage) => lastPage.data.nextCursor,
})

// Get Current User Friends
type GetCurrentUserFriendsSuccessRes =
  GetCurrentUserFriendsResDtoType['success']
export const getCurrentUserFriends = infiniteQueryOptions({
  queryKey: ['users', 'current', 'friends'],
  queryFn: async ({
    pageParam,
  }: {
    pageParam: GetCurrentUserFriendsRequestQueryDtoType['cursor']
  }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserFriendsSuccessRes>(
      serverEndpoints.getCurrentUserFriends,
    )
    return res.data
  },
  initialPageParam: undefined,
  getNextPageParam: (lastPage) => lastPage.data.nextCursor,
})

// Get Current User Friends Snippets
type UserFriendSnippetItem = Omit<
  Snippet,
  'lastUpdatedAt' | 'isPrivate' | 'notes'
> & {
  creator: Pick<
    User,
    'username' | 'firstName' | 'lastName' | 'fullName' | 'image'
  >
  collection: Pick<Collection, 'title' | 'publicId' | 'color'>
  tags: Pick<Tag, 'name'>[]
  forkedCount: number
}
type GetCurrentUserFriendsSnippetsSuccessRes = SharedPaginatedSuccessRes<
  UserFriendSnippetItem[]
>
export const getCurrentUserFriendsSnippets = infiniteQueryOptions({
  queryKey: ['users', 'current', 'friends', 'snippets'],
  queryFn: async ({ pageParam }: { pageParam: Cursor | null }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserFriendsSnippetsSuccessRes>(
      serverEndpoints.getCurrentUserFriendsSnippets,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
