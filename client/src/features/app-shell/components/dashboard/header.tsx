import { HeaderWrapper } from '../header-wrapper'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { Logo } from '../logo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { HeaderUserMenu } from './header-user-menu'

export function DashBoardHeader() {
  return (
    <HeaderWrapper className="justify-between">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="relative w-96 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            className="pl-10 bg-muted/50 border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" asChild>
          <Link to="/dashboard/snippets/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Snippet
          </Link>
        </Button>

        <HeaderUserMenu />
      </div>
    </HeaderWrapper>
  )
}
