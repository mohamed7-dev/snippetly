export const serverEndpoints = {
  refreshToken: '/auth/refresh-token',
  login: '/auth/login',
  signup: '/auth/signup',
  currentUserCollections: '/folders/current',
  currentUserSnippets: '/snippets/user/current',
  currentUserDashboard: '/users/current/dashboard',
}

export const clientRoutes = {
  landing: '/',
  forgotPassword: '/forgot-password',
  signup: '/signup',
  login: '/login',
  dashboard: '/dashboard',
  collections: '/dashboard/collections',
  collection: '/dashboard/collections/$slug',
  friends: '/dashboard/friends',
} as const
