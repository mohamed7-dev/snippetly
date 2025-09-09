import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import { queryOptions } from '@tanstack/react-query'
import type { User } from './types'
import type { Snippet } from '@/features/snippets/lib/types'

type GetCurrentUserDashboardSuccessRes = SharedSuccessRes<
  User & {
    snippetsCount: number
    foldersCount: number
    friendsCount: number
    snippets: Snippet[]
  }
>

export const getCurrentUserDashboardOptions = queryOptions({
  queryKey: ['users', 'current', 'dashboards'],
  queryFn: async () => {
    const res = await api.get<GetCurrentUserDashboardSuccessRes>(
      serverEndpoints.currentUserDashboard,
    )
    return res.data
  },
})
