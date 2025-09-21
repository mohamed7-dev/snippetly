import { SidebarContent } from './sidebar-content'

export function DesktopSidebar() {
  return (
    <div className="hidden md:block w-64 flex-shrink-0">
      <SidebarContent />
    </div>
  )
}
