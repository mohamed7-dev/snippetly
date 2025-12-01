export interface User {
  id: number
  username: string
  isPrivate: boolean
  firstName: string
  lastName: string
  fullName: string
  email: string
  password: string
  bio: string | null
  image: string | null
  imageKey: string | null
  imageCustomId: string | null
  acceptedPolicies: boolean
  emailVerifiedAt: Date | null
  emailVerificationToken: string | null
  emailVerificationTokenExpiresAt: Date | null
  resetPasswordToken: string | null
  resetPasswordTokenExpiresAt: Date | null
  refreshTokens: string[]
  joinedAt: string
  lastUpdatedAt: string
}

export type UserActivityStats = {
  snippetsCount: number
  collectionsCount: number
  forkedSnippetsCount: number
  forkedCollectionsCount: number
  friendsCount: number
  friendsInboxCount: number
  friendsOutboxCount: number
}

export interface Friendship {
  requesterId: number
  addresseeId: number
  requestStatus: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  requestSentAt: string
  requestAcceptedAt: string
  requestRejectedAt: string
  requestCancelledAt: string
}
