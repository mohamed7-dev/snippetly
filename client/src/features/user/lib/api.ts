import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedPaginatedSuccessRes, SharedSuccessRes } from '@/lib/types'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { Friendship, User, UserActivityStats } from './types'
import type { Collection } from '@/features/collections/lib/types'
import type { Snippet } from '@/features/snippets/lib/types'
import type { Tag } from '@/features/tags/lib/types'

// Get User Profile
type ProfileItem = Pick<
  User,
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'image'
  | 'bio'
  | 'joinedAt'
  | 'lastUpdatedAt'
  | 'acceptedPolicies'
  | 'emailVerifiedAt'
  | 'isPrivate'
  | 'email'
>

type GetUserProfileSuccessRes = SharedSuccessRes<{
  profile: Omit<
    ProfileItem,
    'acceptedPolicies' | 'isPrivate' | 'emailVerifiedAt' | 'lastUpdatedAt'
  > &
    Partial<
      Pick<
        ProfileItem,
        'acceptedPolicies' | 'isPrivate' | 'emailVerifiedAt' | 'lastUpdatedAt'
      >
    >
  stats: UserActivityStats
  friendshipInfo?: {
    isCurrentUserAFriend: boolean
    requestStatus?: Friendship['requestStatus']
  }
}>
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

// get current user profile
export const getCurrentUserProfileOptions = queryOptions({
  queryKey: ['users', 'profiles', 'current'],
  queryFn: async () => {
    const res = await api.get<GetUserProfileSuccessRes>(
      serverEndpoints.getCurrentUserProfile,
    )
    return res.data
  },
})

// ######################### Shared Types #######################
type Cursor = {
  id: number
}

type UserItem = Pick<
  User,
  'username' | 'firstName' | 'lastName' | 'fullName' | 'image' | 'bio'
> &
  Pick<Friendship, 'requestStatus' | 'requestSentAt'> & {
    snippetsCount: number
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
type UserFriendItem = UserItem & {
  requestAcceptedAt: string
  recentSnippets: Pick<Snippet, 'title' | 'publicId' | 'addedAt' | 'language'>[]
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
