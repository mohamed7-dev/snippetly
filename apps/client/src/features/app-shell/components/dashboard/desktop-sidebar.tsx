import { SidebarContent } from './sidebar-content'

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:block w-64 border-r border-border bg-muted/30 min-h-[calc(100vh-73px)]">
      <SidebarContent />
    </aside>
  )
}
