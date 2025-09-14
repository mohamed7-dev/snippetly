import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  CalendarIcon,
  Code2Icon,
  EditIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Link, useParams } from '@tanstack/react-router'
import { clientRoutes } from '@/lib/routes'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCollectionQueryOptions } from '../../lib/api'

export function MainContentHeader() {
  const params = useParams({
    from: '/(protected)/dashboard/collections/$slug/',
  })
  const { data } = useSuspenseQuery(getCollectionQueryOptions(params.slug))
  const collection = data.data
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`h-12 w-12 rounded-lg ${collection.color} flex items-center justify-center`}
          >
            <Code2Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-3xl text-balance mb-2">
              {collection.title}
            </h1>
            <p className="text-muted-foreground text-lg text-pretty mb-4">
              {collection.description}
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={collection.creator.image || '/placeholder.svg'}
                    alt={collection.creator.name}
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  by{' '}
                  <span className="font-medium text-foreground">
                    {collection.creator.name}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Code2Icon className="h-4 w-4" />
                  {collection.snippetsCount} snippets
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Updated {new Date(collection.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!collection.isPrivate ? (
                  <Badge variant="outline" className="text-xs">
                    <GlobeIcon className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <LockIcon className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            </div>

            {!!collection.tags.length && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {collection.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                to={clientRoutes.editCollection}
                params={{ slug: collection.slug }}
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Edit Collection
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2Icon className="mr-2 h-4 w-4" />
              Delete Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
