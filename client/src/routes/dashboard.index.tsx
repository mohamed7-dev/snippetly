import { DashBoardPageView } from '@/components/views/dashboard-page-view'
import { DashBoardHeader } from '@/features/app-shell'
import { getCurrentUserDashboardOptions } from '@/features/user/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getCurrentUserDashboardOptions)
  },
})

function RouteComponent() {
  return (
    <div className="min-h-screen">
      <DashBoardHeader />
      <DashBoardPageView />
    </div>
  )
}
