import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout'
import { DiscoverPage } from '@/features/discover/components'

export function DiscoverPageView() {
  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <DiscoverPage />
      </div>
    </DashboardLayout>
  )
}
