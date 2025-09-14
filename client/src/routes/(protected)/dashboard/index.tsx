import { DashBoardPageView } from '@/components/views/dashboard-page-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return <DashBoardPageView />
}
