import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import { FilterIcon, PlusIcon, SearchIcon } from 'lucide-react'
import React from 'react'

export function MainContentHeader() {
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
          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
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
