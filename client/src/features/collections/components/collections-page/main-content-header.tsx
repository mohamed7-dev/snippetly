import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { PlusIcon, SearchIcon } from 'lucide-react'
import React from 'react'
import { FilterMenu } from '../../../../components/filter-menu'

export function MainContentHeader() {
  const navigate = useNavigate({ from: '/dashboard/collections' })
  const { filter } = useSearch({
    from: '/(protected)/dashboard/_dashboard-layout/_error-boundary/collections/',
  })
  return (
    <React.Fragment>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl mb-2">My Collections</h1>
        <p className="text-muted-foreground text-lg">
          Organize your code snippets into themed collections for better
          management
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            className="pl-10 bg-muted/50 border-border"
          />
        </div>
        <div className="flex items-center gap-3">
          <FilterMenu
            onSelect={(selected) => navigate({ search: { filter: selected } })}
            selected={filter}
          />

          <Button size="sm" asChild>
            <Link to={'/dashboard/collections/new'}>
              <PlusIcon className="h-4 w-4 mr-2" />
              <span>New Collection</span>
            </Link>
          </Button>
        </div>
      </div>
    </React.Fragment>
  )
}
