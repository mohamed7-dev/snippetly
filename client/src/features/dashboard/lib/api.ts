import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import { queryOptions } from '@tanstack/react-query'
import type { Snippet } from '@/features/snippets/lib/types'
import type { User } from '@/features/user/lib/types'
import type { Collection } from '@/features/collections/lib/types'

// Get Current User's Dashboard
type GetCurrentUserDashboardSuccessRes = SharedSuccessRes<
  User & {
    snippetsCount: number
    foldersCount: number
    friendsCount: number
    snippets: Snippet[]
    folders: Collection[]
  }
>

export const getCurrentUserDashboardOptions = queryOptions({
  queryKey: ['users', 'current', 'dashboards'],
  queryFn: async () => {
    const res = await api.get<GetCurrentUserDashboardSuccessRes>(
      serverEndpoints.getCurrentUserDashboard,
    )
    return res.data
  },
})
