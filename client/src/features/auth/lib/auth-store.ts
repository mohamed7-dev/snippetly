let accessToken: string | null = null

type Listener = (token: string | null) => void

const listeners = new Set<Listener>()

export const authStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token
    listeners.forEach((l) => l(token))
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
