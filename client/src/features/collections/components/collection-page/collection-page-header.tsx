import { Button } from '@/components/ui/button'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, PlusIcon } from 'lucide-react'
import { SearchForm } from './search-form'
import React from 'react'

export function CollectionPageHeader() {
  return (
    <React.Fragment>
      <HeaderWrapper className="flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link
              to={'/dashboard/collections'}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Collections
            </Link>
          </Button>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <SearchForm className="hidden sm:flex" />
          <Button size="sm" asChild>
            <Link to={'/dashboard/snippets/new'}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Snippet
            </Link>
          </Button>
        </div>
      </HeaderWrapper>
      <div className="w-full flex-1 flex md:hidden space-y-2 p-2 border-b border-border">
        <SearchForm className="w-full" />
      </div>
    </React.Fragment>
  )
}
