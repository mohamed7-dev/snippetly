import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Link } from '@tanstack/react-router'
import { Code2Icon, SearchIcon, UserPlusIcon } from 'lucide-react'

export function PageHeader() {
  return (
    <HeaderWrapper className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Code2Icon className="h-5 w-5" />
          Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="font-heading font-semibold text-lg">Friends</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            className="pl-10 bg-muted/50 border-border"
          />
        </div>
        <Button size="sm" asChild>
          <Link to="/dashboard/discover">
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Find Friends
          </Link>
        </Button>
      </div>
    </HeaderWrapper>
  )
}
