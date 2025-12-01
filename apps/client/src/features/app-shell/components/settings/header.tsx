import { HeaderWrapper } from '../header-wrapper'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { HeaderUserMenu } from '../dashboard/header-user-menu'
import { MobileSidebar } from './mobile-sidebar'

export function Header() {
  return (
    <HeaderWrapper className="justify-between">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h1>
      </div>
      <HeaderUserMenu />
    </HeaderWrapper>
  )
}
