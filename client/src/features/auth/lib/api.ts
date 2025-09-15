import type { User } from '@/features/user/lib/types'
import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'

type RefreshAccessTokenSuccessRes = SharedSuccessRes<{
  accessToken: string
  user: User
}>

export async function refreshAccessToken(): Promise<RefreshAccessTokenSuccessRes> {
  const res = await api.put(serverEndpoints.refreshToken)
  return res.data
}
