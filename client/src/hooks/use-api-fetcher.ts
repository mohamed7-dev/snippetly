import { useAuth } from '@/features/auth'
import { api, refreshAccessToken } from '@/lib/api'

export function useApiFetcher() {
  const { accessToken, setAccessToken } = useAuth()

  const fetcher = async <T>(
    url: string,
    options?: { method?: string; data?: any },
  ): Promise<T> => {
    try {
      const res = await api.request<T>({
        url,
        method: options?.method || 'GET',
        data: options?.data,
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      })
      return res.data
    } catch (err: any) {
      if (err.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken()
          setAccessToken(newToken)
          localStorage.setItem('accessToken', newToken)

          // retry request
          const retryRes = await api.request<T>({
            url,
            method: options?.method || 'GET',
            data: options?.data,
            headers: { Authorization: `Bearer ${newToken}` },
          })
          return retryRes.data
        } catch (refreshErr) {
          setAccessToken(null)
          localStorage.removeItem('accessToken')
          window.location.href = '/login'
          throw refreshErr
        }
      }
      throw err
    }
  }

  return fetcher
}
