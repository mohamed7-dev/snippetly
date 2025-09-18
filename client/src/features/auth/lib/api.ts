import { publicApi } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import type { AxiosResponse } from 'axios'
import type { AuthUser } from './types'

type RefreshAccessTokenSuccessRes = AxiosResponse<
  SharedSuccessRes<{
    accessToken: string
    user: AuthUser
  }>
>

export async function refreshAccessToken(): Promise<RefreshAccessTokenSuccessRes> {
  const res = await publicApi.put(serverEndpoints.refreshToken, undefined, {
    withCredentials: true,
  })
  return res
}
