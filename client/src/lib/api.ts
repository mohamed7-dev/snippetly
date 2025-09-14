import axios from 'axios'
import {
  getAccessToken,
  getUser,
  setAuth,
} from '@/features/auth/lib/auth-store'
import { refreshAccessToken } from '@/features/auth/lib/api'

export const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

if (!API_SERVER_URL) {
  throw new Error('Missing API_SERVER_URL Env Variable..')
}

export const api = axios.create({
  baseURL: API_SERVER_URL,
  withCredentials: true, // 👈 send cookies (refresh token lives here)
})

let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token || ''))
  refreshQueue = []
}

// attach token
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = 'Bearer '.concat(token)
  }
  return config
})

// refresh logic
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            if (token) {
              original.headers.Authorization = 'Bearer '.concat(token)
              resolve(api(original))
            } else {
              resolve(Promise.reject(error))
            }
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const data = await refreshAccessToken()
        const newToken = data.data.accessToken

        // ⚡ sync both store + context (context picks up from store)
        setAuth(newToken, getUser())

        processQueue(newToken)
        original.headers.Authorization = 'Bearer '.concat(newToken)
        return api(original)
      } catch (err) {
        processQueue(null)
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)
