import { Outlet } from '@tanstack/react-router'
import { DesktopSidebar } from './desktop-sidebar'
import { Header } from './header'

export function SettingsLayout() {
  return (
    <div>
      <Header />
      <div className="flex gap-16 px-4 mt-8">
        <DesktopSidebar />
        <main className="container flex-1 max-w-3xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
