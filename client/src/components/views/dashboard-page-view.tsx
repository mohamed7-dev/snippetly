import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout'
import { DashboardPage } from '@/features/dashboard/components'

export function DashBoardPageView() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  )
}
