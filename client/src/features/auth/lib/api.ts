import type { User } from '@/features/user/lib/types'
import { publicApi } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import type { AxiosResponse } from 'axios'

type RefreshAccessTokenSuccessRes = AxiosResponse<
  SharedSuccessRes<{
    accessToken: string
    user: User
  }>
>

export async function refreshAccessToken(): Promise<RefreshAccessTokenSuccessRes> {
  const res = await publicApi.put(serverEndpoints.refreshToken, undefined, {
    withCredentials: true,
  })
  return res
}
