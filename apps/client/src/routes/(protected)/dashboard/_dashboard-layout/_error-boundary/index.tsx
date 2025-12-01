import { searchFilterSchema } from '@/components/filter-menu'
import { DashBoardPageView } from '@/components/views/dashboard-page-view'
import { getCurrentSnippetsOptions } from '@/features/snippets/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/dashboard/_dashboard-layout/_error-boundary/',
)({
  component: DashboardPage,
  head: () => {
    return {
      meta: [
        {
          title: 'All Snippets',
        },
      ],
    }
  },
  validateSearch: searchFilterSchema,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchInfiniteQuery(getCurrentSnippetsOptions)
  },
})

function DashboardPage() {
  return <DashBoardPageView />
}
