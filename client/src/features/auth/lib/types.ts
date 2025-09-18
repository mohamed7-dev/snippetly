import type { User } from '@/features/user/lib/types'

export type AuthUser = Pick<
  User,
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'image'
  | 'email'
  | 'joinedAt'
  | 'lastUpdatedAt'
  | 'bio'
  | 'acceptedPolicies'
  | 'emailVerifiedAt'
  | 'isPrivate'
>
