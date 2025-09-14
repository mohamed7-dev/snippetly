import { DashboardLayout } from '@/features/app-shell/components/dashboard/dashboard-layout'
import { CollectionsPage } from '@/features/collections/components/collections-page'

export function CollectionsPageView() {
  return (
    <DashboardLayout>
      <CollectionsPage />
    </DashboardLayout>
  )
}
