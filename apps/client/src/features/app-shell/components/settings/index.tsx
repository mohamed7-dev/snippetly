import { Header } from './header'
import { DesktopSidebar } from './desktop-sidebar'
import { Outlet } from '@tanstack/react-router'

export function SettingsLayout() {
  return (
    <div>
      <Header />
      <div className="flex gap-[4rem] px-4 mt-8">
        <DesktopSidebar />
        <main className="container flex-1 max-w-3xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
