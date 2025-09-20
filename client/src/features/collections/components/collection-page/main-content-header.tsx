import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Code2Icon, GlobeIcon, LockIcon } from 'lucide-react'
import { Link, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCollectionQueryOptions } from '../../lib/api'
import { CollectionActionMenu } from '../shared/collection-action-menu'

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
            className={`size-12 rounded-lg flex items-center justify-center`}
          >
            <Code2Icon
              className={'size-8'}
              style={{
                stroke: collection.color,
              }}
            />
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
                <Link
                  to={'/profile/$name'}
                  params={{ name: collection.creator.username }}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={collection.creator.image || '/placeholder.svg'}
                      alt={collection.creator.username}
                    />
                    <AvatarFallback>
                      {collection.creator.username}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <span className="text-sm text-muted-foreground">
                  by{' '}
                  <span className="font-medium text-foreground">
                    {collection.creator.fullName}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Code2Icon className="h-4 w-4" />
                  {collection.snippetsCount} snippets
                </div>
                {collection.lastUpdatedAt && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Updated{' '}
                    {new Date(collection.lastUpdatedAt).toLocaleDateString()}
                  </div>
                )}
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
        <CollectionActionMenu
          collection={{
            ...collection,
            creatorName: collection.creator.username,
          }}
        />
      </div>
    </div>
  )
}
