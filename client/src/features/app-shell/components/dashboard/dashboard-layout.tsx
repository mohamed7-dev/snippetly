import { DashBoardHeader } from './header'
import { DashboardSidebar } from './sidebar'

type DashboardLayoutProps = {
  children: React.ReactNode
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <DashBoardHeader />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
