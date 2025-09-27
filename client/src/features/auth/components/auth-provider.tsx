import React from 'react'
import { authStore } from '../lib/auth-store'
import { refreshAccessToken } from '@/features/auth/lib/api'
import { parseJwt } from '@/lib/utils'

export type LoggedInUser = {
  name: string
  email: string
  id: number
  image: string | null
} | null

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  accessToken: string | null
  status: AuthStatus
  hasTriedRefresh: boolean
  isRefreshing: boolean
  login: (token: string) => void
  logout: () => void
  updateAccessToken: (token: string | null | undefined) => void
  getCurrentUser: () => LoggedInUser
  isLoggedOut: boolean
  isAuthenticated: boolean
  isAuthenticatedNow: () => boolean
  ensureReady: () => Promise<void>
  refreshIfNeeded: (force?: boolean) => Promise<string | undefined>
  setHasTriedRefresh: (v: boolean) => void
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = React.useState<string | null>(
    authStore.getAccessToken?.() ?? null,
  )
  const [isLoggedOut, setIsLoggedOut] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    Boolean(authStore.getAccessToken?.()),
  )
  const [status, setStatus] = React.useState<AuthStatus>('unknown')
  const [hasTriedRefresh, setHasTriedRefresh] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const inFlightRef = React.useRef<Promise<string | undefined> | null>(null)
  const refreshTimerRef = React.useRef<number | null>(null)
  // Prevent feedback loops between authStore subscription and local writers
  const suppressStoreSyncRef = React.useRef(false)

  // refresh access token before it expires or if it's expired
  const scheduleRefresh = React.useCallback((token: string) => {
    // Clear previous timer
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
    try {
      const decoded: any = parseJwt(token)
      const exp: number | undefined = decoded?.exp
      if (!exp) return
      const nowSec = Math.floor(Date.now() / 1000)
      const skew = 90 // seconds before expiry to refresh
      const delayMs = Math.max((exp - nowSec - skew) * 1000, 0)
      if (delayMs === 0) {
        // Expired or near expiry, trigger background refresh
        void refreshIfNeeded(true)
        return
      }
      refreshTimerRef.current = window.setTimeout(() => {
        void refreshIfNeeded(true)
      }, delayMs) as unknown as number
    } catch {
      // ignore parsing errors
    }
  }, [])

  const login = (token: string) => {
    setAccessToken(token)
    if (!suppressStoreSyncRef.current) {
      authStore.setAccessToken?.(token)
    }
    setIsAuthenticated(true)
    setIsLoggedOut(false)
    setStatus('authenticated')
    scheduleRefresh(token)
  }
  const logout = () => {
    setAccessToken(null)
    if (!suppressStoreSyncRef.current) {
      // Prefer a null-capable setter; cast kept for compatibility with store typing
      authStore.setAccessToken?.(null as unknown as string)
    }
    setIsLoggedOut(true)
    setIsAuthenticated(false)
    setStatus('unauthenticated')
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }

  const updateAccessToken = (token: string | null | undefined) => {
    if (token) {
      setAccessToken(token)
      if (!suppressStoreSyncRef.current) {
        authStore.setAccessToken?.(token)
      }
      setIsAuthenticated(true)
      setIsLoggedOut(false)
      setStatus('authenticated')
      scheduleRefresh(token)
    } else {
      logout()
    }
  }

  /**
   * Refresh the access token if necessary.
   * It Deduplicates the refresh process by using a ref to track the in flight request.
   * It also handles the refresh timer.
   */
  const refreshIfNeeded = React.useCallback(
    async (force?: boolean): Promise<string | undefined> => {
      if (inFlightRef.current) return inFlightRef.current

      const exec = async (): Promise<string | undefined> => {
        const token = accessToken ?? authStore.getAccessToken?.() ?? null
        try {
          const decoded: any = token ? parseJwt(token) : null
          const nowSec = Math.floor(Date.now() / 1000)
          const exp: number | undefined = decoded?.exp
          const nearExpiry = exp ? exp - nowSec < 90 : true
          if (!force && token && !nearExpiry) {
            // No refresh necessary
            setStatus('authenticated')
            setIsAuthenticated(true)
            setIsLoggedOut(false)
            return token
          }
        } catch {
          // fallthrough to refresh
        }

        setIsRefreshing(true)
        try {
          const res = await refreshAccessToken()
          const newToken = res.data.data.accessToken as string
          updateAccessToken(newToken)
          setStatus('authenticated')
          return newToken
        } catch (e) {
          logout()
          return undefined
        } finally {
          setIsRefreshing(false)
        }
      }

      const p = exec().finally(() => {
        inFlightRef.current = null
      })
      inFlightRef.current = p
      return p
    },
    [accessToken],
  )

  /**
   * Ensure that the auth context is ready to use.
   * This will refresh the access token if necessary.
   * This should be called before any API calls are made.
   * This should only be called once per app startup/reload
   */
  const ensureReady = React.useCallback(async () => {
    if (hasTriedRefresh) return
    try {
      const token = accessToken ?? authStore.getAccessToken?.() ?? null
      if (!token) {
        await refreshIfNeeded(true)
      } else {
        // Validate or schedule
        setStatus('authenticated')
        setIsAuthenticated(true)
        setIsLoggedOut(false)
        scheduleRefresh(token)
      }
    } finally {
      setHasTriedRefresh(true)
    }
  }, [hasTriedRefresh, accessToken, refreshIfNeeded, scheduleRefresh])

  const getCurrentUser = () => {
    const token = accessToken ?? authStore.getAccessToken?.() ?? null
    if (token) {
      const decoded = parseJwt(token)
      return decoded as LoggedInUser
    }
    return null
  }

  const isAuthenticatedNow = () => {
    const token = accessToken ?? authStore.getAccessToken?.() ?? null
    return Boolean(token)
  }

  React.useEffect(() => {
    // Keep state in sync with store if it changes externally
    const unsubscribe = authStore.subscribe?.((token: string | null) => {
      suppressStoreSyncRef.current = true
      try {
        if (token) {
          setAccessToken(token)
          setIsAuthenticated(true)
          setIsLoggedOut(false)
          setStatus('authenticated')
          scheduleRefresh(token)
        } else {
          // Clear local state without writing back to store to avoid loops
          setAccessToken(null)
          setIsAuthenticated(false)
          setIsLoggedOut(true)
          setStatus('unauthenticated')
          if (refreshTimerRef.current) {
            window.clearTimeout(refreshTimerRef.current)
            refreshTimerRef.current = null
          }
        }
      } finally {
        suppressStoreSyncRef.current = false
      }
    })
    return () => {
      if (unsubscribe) unsubscribe()
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current)
    }
  }, [scheduleRefresh])

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        status,
        hasTriedRefresh,
        isRefreshing,
        login,
        logout,
        updateAccessToken,
        getCurrentUser,
        isLoggedOut,
        isAuthenticated,
        isAuthenticatedNow,
        ensureReady,
        refreshIfNeeded,
        setHasTriedRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
