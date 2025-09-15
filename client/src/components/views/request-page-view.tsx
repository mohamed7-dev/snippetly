import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout'
import { RequestPage } from '@/features/user/components/requests-page'

export function RequestPageView() {
  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <RequestPage />
      </div>
    </DashboardLayout>
  )
}
