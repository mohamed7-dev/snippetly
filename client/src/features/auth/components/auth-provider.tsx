import React from 'react'
import { jwtDecode } from 'jwt-decode'
import { authStore } from '../lib/auth-store'

export type LoggedInUser = {
  name: string
  email: string
  id: number
  image: string | null
} | null

export interface AuthContextValue {
  accessToken: string | null
  login: (token: string) => void
  logout: () => void
  updateAccessToken: (token: string) => void
  getCurrentUser: () => LoggedInUser
  isLoggedOut: boolean
  isAuthenticated: boolean
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = React.useState<string | null>(null)
  const [isLoggedOut, setIsLoggedOut] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  const login = (token: string) => {
    setAccessToken(token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setAccessToken(null)
    setIsLoggedOut(true)
  }

  const updateAccessToken = (token: string) => {
    setAccessToken(token)
    setIsAuthenticated(true)
  }

  const getCurrentUser = () => {
    if (accessToken) {
      const decoded = jwtDecode<LoggedInUser>(accessToken)
      return decoded
    }
    return null
  }

  React.useEffect(() => {
    authStore.subscribe(setAccessToken)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        login,
        logout,
        updateAccessToken,
        getCurrentUser,
        isLoggedOut,
        isAuthenticated,
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
