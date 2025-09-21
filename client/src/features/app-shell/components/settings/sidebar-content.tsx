import { SETTINGS_NAV_ITEMS } from '../../lib/constants'
import { cn } from '@/lib/utils'
import { Link, useLocation } from '@tanstack/react-router'

export function SidebarContent() {
  const location = useLocation()
  const currentPathname = location.pathname
  return (
    <nav className="space-y-2">
      {SETTINGS_NAV_ITEMS.map((item) => {
        const isActive = item.href === currentPathname
        return (
          <Link
            key={item.href}
            to={item.href}
            activeProps={{ className: 'bg-primary text-primary-foreground' }}
            className={cn(
              'flex items-start gap-3 rounded-lg px-3 py-3 text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">{item.title}</div>
              <div
                className={cn(
                  'text-xs mt-1',
                  isActive
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground',
                )}
              >
                {item.description}
              </div>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
