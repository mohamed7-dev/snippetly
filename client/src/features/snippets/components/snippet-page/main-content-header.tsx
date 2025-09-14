import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSuspenseQuery } from '@tanstack/react-query'
import { GitForkIcon, GlobeIcon, LockIcon } from 'lucide-react'
import { getSnippetQueryOptions } from '../../lib/api'
import { useParams } from '@tanstack/react-router'

export function MainContentHeader() {
  const params = useParams({ from: '/(protected)/dashboard/snippets/$slug/' })

  const { data } = useSuspenseQuery(getSnippetQueryOptions(params.slug))
  const snippet = data.data

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="font-heading font-bold text-3xl text-balance mb-2">
            {snippet.title}
          </h1>
          <p className="text-muted-foreground text-lg text-pretty">
            {snippet.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={snippet.creator.image || '/placeholder.svg'}
              alt={snippet.creator.name}
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{snippet.creator.name}</p>
            <p className="text-xs text-muted-foreground">
              @{snippet.creator.name}
            </p>
          </div>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <GitForkIcon className="h-4 w-4" /> 0
          </div>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {snippet.language}
          </Badge>
          {!snippet.isPrivate ? (
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

      {!!snippet.tags.length && (
        <div className="flex items-center gap-2 flex-wrap">
          {snippet.tags.map((tag) => (
            <Badge key={tag.name} variant="outline" className="text-xs">
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
