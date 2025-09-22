export const serverEndpoints = {
  // auth
  refreshToken: '/auth/refresh',
  login: '/auth/login',
  signup: '/auth/signup',
  logout: '/auth/logout',
  sendVerificationEmail: '/auth/send-verification-email',
  verifyEmailToken: '/auth/verify-email-token',
  sendResetEmail: '/auth/send-reset-email',
  resetPassword: '/auth/reset-password',
  // collections
  createCollection: '/collections',
  updateCollection: (slug: string) => `/collections/${slug}`,
  deleteCollection: (slug: string) => `/collections/${slug}`,
  forkCollection: (slug: string) => `/collections/${slug}/fork`,
  discoverCollections: '/collections/discover',
  getCurrentUserCollections: '/collections/current',
  getUserCollections: (name: string) => `/collections/user/${name}`,
  getCollection: (slug: string) => `/collections/${slug}`,
  // snippets
  createSnippet: '/snippets',
  updateSnippet: (slug: string) => `/snippets/${slug}`,
  deleteSnippet: (slug: string) => `/snippets/${slug}`,
  forkSnippet: (slug: string) => `/snippets/${slug}/fork`,
  discoverSnippets: '/snippets/discover',
  getCurrentUserSnippets: '/snippets/user/current',
  getCurrentUserFriendsSnippets: '/snippets/user/current/friends',
  getUserSnippets: (name: string) => `/snippets/user/${name}`,
  getUserFriendsSnippets: (name: string) => `/snippets/user/${name}/friends`,
  getSnippet: (slug: string) => `/snippets/${slug}`,
  // users
  updateUser: '/users',
  deleteUser: '/users',
  sendFriendshipRequest: (friendName: string) =>
    `/users/add-friend/${friendName}`,
  acceptFriendshipRequest: (friendName: string) =>
    `/users/accept-friend/${friendName}`,
  rejectFriendshipRequest: (friendName: string) =>
    `/users/reject-friend/${friendName}`,
  cancelFriendshipRequest: (friendName: string) =>
    `/users/cancel-friend/${friendName}`,
  discoverUsers: '/users/discover',
  getCurrentUserProfile: '/users/current',
  getCurrentUserFriends: '/users/current/friends',
  getCurrentUserInbox: '/users/current/inbox',
  getCurrentUserOutbox: '/users/current/outbox',
  getCurrentUserDashboard: '/users/current/dashboard',
  getUserProfile: (name: string) => `/users/${name}`,
  getSnippetsByCollection: (slug: string) => `/snippets/collection/${slug}`,
  // tags
  getPopularTags: '/tags/popular',
  // upload
  uploadAvatar: 'upload-avatar',
}

export const clientRoutes = {
  landing: '/',
  forgotPassword: '/forgot-password',
  signup: '/signup',
  login: '/login',
  dashboard: '/dashboard',
  friends: '/dashboard/friends',
  // Collection
  collections: '/(protected)/dashboard/collections',
  collection: '/(protected)/dashboard/collections/$slug',
  newCollection: '/dashboard/collections/new',
  editCollection: '/dashboard/collections/$slug/edit',
  createCollection: '/dashboard/collections/new',
  // Snippet
  createSnippet: '/dashboard/snippets/new',
} as const
