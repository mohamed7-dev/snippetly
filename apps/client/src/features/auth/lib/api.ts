import { api, publicApi } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type {
  LoginResponseDtoType,
  LogoutResponseDtoType,
  RefreshTokenResponseDtoType,
  SendRTokenResponseDtoType,
  SendVEmailResponseDtoType,
  SignupResponseDtoType,
  VerifyRTokenResponseDtoType,
  VerifyVTokenResponseDtoType,
} from '@snippetly/common/dto'

export async function refreshAccessToken() {
  const res = await publicApi.put<RefreshTokenResponseDtoType['success']>(
    serverEndpoints.refreshToken,
    undefined,
    {
      withCredentials: true,
    },
  )
  return res
}

export async function signup(body: unknown) {
  const res = await api.post<SignupResponseDtoType['success']>(
    serverEndpoints.signup,
    body,
  )
  return res
}

export async function login(body: unknown) {
  const res = await api.put<LoginResponseDtoType['success']>(
    serverEndpoints.login,
    body,
  )

  return res
}

export async function logout() {
  const res = await api.put<LogoutResponseDtoType['success']>(
    serverEndpoints.logout,
  )
  return res
}

export async function sendVToken(body: unknown) {
  const res = await api.put<SendVEmailResponseDtoType['success']>(
    serverEndpoints.sendVerificationEmail,
    body,
  )
  return res
}

export async function verifyVToken(searchParams: string, body: unknown) {
  const res = await api.put<VerifyVTokenResponseDtoType['success']>(
    serverEndpoints.verifyEmailToken + '?' + searchParams,
    body,
  )
  return res
}

export async function sendRToken(body: unknown) {
  const res = await api.put<SendRTokenResponseDtoType['success']>(
    serverEndpoints.sendResetEmail,
    body,
  )
  return res
}

export async function resetPassword(searchParams: string, body: unknown) {
  const res = await api.put<VerifyRTokenResponseDtoType['success']>(
    serverEndpoints.resetPassword + '?' + searchParams,
    body,
  )
  return res
}
