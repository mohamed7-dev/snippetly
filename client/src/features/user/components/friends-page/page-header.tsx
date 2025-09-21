import { Button } from '@/components/ui/button'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Link } from '@tanstack/react-router'
import { Code2Icon, UserPlusIcon } from 'lucide-react'
import { SearchForm } from './search-form'
import React from 'react'

export function PageHeader() {
  return (
    <React.Fragment>
      <HeaderWrapper className="flex items-center justify-between flex-wrap gap-4">
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

        <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
          <SearchForm className="hidden md:flex" />
          <Button size="sm" asChild>
            <Link to="/dashboard/discover">
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Find Friends
            </Link>
          </Button>
        </div>
      </HeaderWrapper>
      <div className="flex md:hidden border-border border-b p-2">
        <SearchForm className="w-full" />
      </div>
    </React.Fragment>
  )
}
