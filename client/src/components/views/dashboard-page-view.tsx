import { MainContentHeader } from '@/features/dashboard/components/main-content-header'
import { StatsSection } from '@/features/dashboard/components/stats-section'
import { SnippetsSection } from '@/features/dashboard/components/snippets-section'
import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout'

export function DashBoardPageView() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <MainContentHeader />
        {/* Stats Cards */}
        <StatsSection />
      </div>
      <SnippetsSection />
    </DashboardLayout>
  )
}
