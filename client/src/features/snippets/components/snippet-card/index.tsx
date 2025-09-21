import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EditIcon } from 'lucide-react'
import type { Snippet } from '../../lib/types'
import type { Tag } from '@/features/tags/lib/types'
import { CopyButton } from '../copy-button'
import { Link } from '@tanstack/react-router'
import {
  SnippetActionsDropdown,
  type SnippetActionsDropdownProps,
} from '../shared/snippet-actions-dropdown'
import { useAuth } from '@/features/auth/components/auth-provider'
import type { User } from '@/features/user/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type SnippetItem = Pick<
  Snippet,
  | 'publicId'
  | 'title'
  | 'code'
  | 'language'
  | 'isPrivate'
  | 'addedAt'
  | 'description'
> & {
  tags: Pick<Tag, 'name'>[]
  creator: Pick<
    User,
    'image' | 'username' | 'firstName' | 'lastName' | 'fullName'
  >
}

interface SnippetCardProps
  extends Omit<SnippetActionsDropdownProps, 'snippet'> {
  snippet: SnippetItem
}

export function SnippetCard({ snippet, onCopy, ...props }: SnippetCardProps) {
  const ctx = useAuth()
  const user = ctx?.getCurrentUser()
  const creator = snippet.creator
  return (
    <Card className="border-border hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-heading group-hover:text-primary transition-colors">
              <Link
                to={'/dashboard/snippets/$slug'}
                params={{ slug: snippet.publicId }}
                preload={false}
              >
                {snippet.title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1 text-pretty">
              {snippet.description}
            </CardDescription>
          </div>
          <SnippetActionsDropdown
            snippet={{ ...snippet, creatorName: creator.username }}
            onCopy={onCopy}
            {...props}
          />
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={creator.image || '/placeholder.svg'}
                alt={creator.username}
              />
              <AvatarFallback>
                {creator.username
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                to={'/profile/$name'}
                params={{ name: creator.username }}
                className="font-semibold hover:text-primary"
              >
                {creator.fullName}
              </Link>
              <p className="text-sm text-muted-foreground">
                @{creator.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs font-mono">
              {snippet.language}
            </Badge>
            {!snippet.isPrivate && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(snippet.addedAt)?.toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-col justify-between">
        <div className="h-48 bg-muted/50 rounded-lg p-3 font-mono text-sm overflow-hidden border">
          <pre className="text-foreground whitespace-pre-wrap line-clamp-6 text-xs leading-relaxed">
            {snippet.code}
          </pre>
        </div>
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          {'tags' in snippet
            ? snippet?.tags?.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="outline"
                  className="text-xs hover:bg-primary/10 cursor-pointer"
                >
                  #{tag.name}
                </Badge>
              ))
            : null}
        </div>
        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton code={snippet.code} onClick={() => onCopy} />
          {creator.username === user?.name && (
            <Button size="sm" variant="ghost" asChild>
              <Link
                to="/dashboard/snippets/$slug/edit"
                params={{ slug: snippet.publicId }}
                preload={false}
              >
                <EditIcon className="h-3 w-3 mr-1" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
