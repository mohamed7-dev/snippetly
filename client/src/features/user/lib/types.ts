export interface User {
  id: number
  name: string
  isPrivate: boolean
  firstName: string
  lastName: string
  email: string
  password: string
  bio: string | null
  image: string | null
  acceptedPolicies: boolean
  emailVerifiedAt: Date | null
  emailVerificationToken: string | null
  emailVerificationTokenExpiresAt: Date | null
  resetPasswordToken: string | null
  resetPasswordTokenExpiresAt: Date | null
  refreshTokens: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Friendship {
  requesterId: number
  addresseeId: number
  status: 'pending' | 'accepted' | 'rejected'
  id: number
  createdAt: Date
  updatedAt: Date
}
