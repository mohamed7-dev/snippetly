import type { User } from '@/features/user'

export type LoggedInUser = Pick<
  User,
  'email' | 'name' | 'firstName' | 'lastName' | 'id'
> | null

let accessToken: string | null = null

let user: LoggedInUser = null

export function setAuth(token: string | null, userInfo: LoggedInUser) {
  accessToken = token
  user = userInfo
}

export function getAccessToken() {
  return accessToken
}

export function getUser() {
  return user
}
