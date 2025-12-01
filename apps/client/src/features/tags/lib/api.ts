import { api } from '@/lib/api'
import { serverEndpoints } from '@/lib/routes'
import type { SharedSuccessRes } from '@/lib/types'
import { queryOptions } from '@tanstack/react-query'
import type { Tag } from './types'

type GetPopularTagsSuccessRes = SharedSuccessRes<Pick<Tag, 'name'>[]>

export const getPopularTagsOptions = queryOptions({
  queryKey: ['tags', 'popular'],
  queryFn: async () => {
    const res = await api.get<GetPopularTagsSuccessRes>(
      serverEndpoints.getPopularTags,
    )
    return res.data
  },
})
