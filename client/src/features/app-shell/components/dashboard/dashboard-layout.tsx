import { DesktopSidebar } from './desktop-sidebar'
import { DashBoardHeader } from './header'

type DashboardLayoutProps = {
  children: React.ReactNode
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <DashBoardHeader />
      <div className="flex-1 flex">
        <DesktopSidebar />
        <main className="flex-1 py-6 px-3 md:px-6">{children}</main>
      </div>
    </div>
  )
}
