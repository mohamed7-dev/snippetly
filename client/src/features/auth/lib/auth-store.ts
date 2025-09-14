import type { User } from '@/features/user/lib/types'

export type LoggedInUser = Pick<
  User,
  'email' | 'name' | 'firstName' | 'lastName' | 'id'
> | null

let accessToken: string | null = null

let user: LoggedInUser = null

export function setAuth(token: string | null, userInfo: LoggedInUser) {
  accessToken = token
  user = userInfo

  localStorage.removeItem('user')
  localStorage.removeItem('access-token')
  localStorage.setItem('user', JSON.stringify(userInfo))
  localStorage.setItem('access-token', token as string)
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem('access-token')
  return token
}

export function getUser(): LoggedInUser {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}
