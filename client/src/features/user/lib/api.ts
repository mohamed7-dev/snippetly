import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedPaginatedSuccessRes, SharedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { User } from './types'
import type { Collection } from '@/features/collections/lib/types'
import type { Snippet } from '@/features/snippets/lib/types'
import type { Tag } from '@/features/tags/lib/types'

// Get User Profile
type ProfileItem = Pick<
  User,
  'name' | 'firstName' | 'lastName' | 'id' | 'image' | 'bio' | 'createdAt'
> & {
  isCurrentUserAFriend: boolean
}
type GetUserProfileSuccessRes = SharedSuccessRes<ProfileItem> & {
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
export const getUserProfile = (name: string) =>
  queryOptions({
    queryKey: ['users', 'profiles', name],
    queryFn: async () => {
      const res = await api.get<GetUserProfileSuccessRes>(
        serverEndpoints.getUserProfile(name),
      )
      return res.data
    },
  })

type Cursor = {
  id: number
}
type UserItem = Pick<
  User,
  'id' | 'name' | 'firstName' | 'lastName' | 'image' | 'bio'
> & {
  snippetsCount: number
  requestSentAt: Date
}

// Get Current User Inbox
type GetCurrentUserInboxSuccessRes = SharedPaginatedSuccessRes<UserItem[]>
export const getCurrentUserInbox = infiniteQueryOptions({
  queryKey: ['users', 'current', 'inbox'],
  queryFn: async ({ pageParam }: { pageParam: Cursor | null }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserInboxSuccessRes>(
      serverEndpoints.getCurrentUserInbox,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Get Current User Outbox
type GetCurrentUserOutboxSuccessRes = SharedPaginatedSuccessRes<UserItem[]>
export const getCurrentUserOutbox = infiniteQueryOptions({
  queryKey: ['users', 'current', 'outbox'],
  queryFn: async ({ pageParam }: { pageParam: Cursor | null }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserOutboxSuccessRes>(
      serverEndpoints.getCurrentUserOutbox,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Get Current User Friends
type UserFriendItem = Omit<UserItem, 'requestSentAt'> & {
  recentSnippets: Pick<Snippet, 'title' | 'slug' | 'code' | 'language'>[]
  snippetsCount: number
}
type GetCurrentUserFriendsSuccessRes = SharedPaginatedSuccessRes<
  UserFriendItem[]
>
export const getCurrentUserFriends = infiniteQueryOptions({
  queryKey: ['users', 'current', 'friends'],
  queryFn: async ({ pageParam }: { pageParam: Cursor | null }) => {
    const searchParams = new URLSearchParams()
    if (pageParam) {
      searchParams.set('cursor', JSON.stringify(pageParam))
    }
    const res = await api.get<GetCurrentUserFriendsSuccessRes>(
      serverEndpoints.getCurrentUserFriends,
    )
    return res.data
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Get Current User Friends Snippets
type UserFriendSnippetItem = Snippet & {
  friend: Pick<User, 'name' | 'firstName' | 'lastName' | 'image' | 'id'>
  collection: Pick<Collection, 'title' | 'slug' | 'id' | 'color'>
  tags: Pick<Tag, 'name'>[]
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
