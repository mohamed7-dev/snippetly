import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@tanstack/react-router'
import { clientRoutes } from '@/lib/routes'
import {
  BookOpenIcon,
  EditIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { getCurrentUserCollectionsOptions } from '../../lib/api'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'

export function CollectionsGridSection() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(getCurrentUserCollectionsOptions)
  const collections = data.pages?.flatMap((page) => page.items) ?? []
  return (
    <React.Fragment>
      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Card
            key={collection.id}
            className="border-border hover:shadow-lg transition-shadow group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`h-4 w-4 rounded-full ${collection.color}`} />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-heading group-hover:text-primary transition-colors">
                      <Link
                        to={clientRoutes.collection}
                        params={{ slug: collection.code }}
                      >
                        {collection.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-1 text-pretty">
                      {collection.description}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        to={clientRoutes.collection}
                        params={{ slug: collection.code }}
                      >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        View Collection
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to={clientRoutes.editCollection}
                        params={{ slug: collection.code }}
                      >
                        <EditIcon className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  {collection.snippets.length} snippets
                </Badge>
                {!collection.isPrivate && (
                  <Badge variant="secondary" className="text-xs">
                    Public
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  Updated {new Date(collection.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Preview snippets */}
              <div className="space-y-2 mb-4">
                {collection.snippets.slice(0, 3).map((snippet, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                    <span className="flex-1 truncate">{snippet.title}</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {snippet.parseFormat}
                    </Badge>
                  </div>
                ))}
                {collection.snippets.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{collection.snippets.length - 3} more snippets
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1 flex-wrap">
                {collection.tags.map((tag) => (
                  <Badge key={tag.name} variant="outline" className="text-xs">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <InfiniteLoader
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isManual={true}
      />
      {/* Empty State */}
      {collections.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">
            No collections yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first collection to organize your code snippets
          </p>
          <Button asChild>
            <Link to={clientRoutes.newCollection}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Collection
            </Link>
          </Button>
        </div>
      )}
    </React.Fragment>
  )
}
