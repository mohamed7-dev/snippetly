import React from 'react'
import {
  getAccessToken,
  getUser,
  setAuth,
  type LoggedInUser,
} from '../lib/auth-store'

type AuthContextValue = {
  user: ReturnType<typeof getUser>
  accessToken: string | null
  login: (token: string, user: LoggedInUser) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState(getUser())
  const [accessToken, setAccessToken] = React.useState(getAccessToken())

  const login = (token: string, user: any) => {
    setUser(user)
    setAccessToken(token)
    setAuth(token, user) // sync module store
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setAuth(null, null) // sync module store
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
