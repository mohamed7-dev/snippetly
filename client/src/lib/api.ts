import axios from 'axios'
import { serverRoutes } from './routes'

export const API_SERVER_URL = import.meta.env.API_SERVER_URL

export const api = axios.create({
  baseURL: API_SERVER_URL,
  withCredentials: true, // 👈 send cookies (refresh token lives here)
})

export async function refreshAccessToken() {
  const res = await api.post(serverRoutes.refreshToken)
  return res.data.accessToken as string
}
