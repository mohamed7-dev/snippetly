import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInfiniteQuery } from '@tanstack/react-query'
import React from 'react'
import { getCurrentUserFriendsSnippets } from '../../lib/api'

export function FriendsSnippetsTabContent() {
  const { data } = useInfiniteQuery(getCurrentUserFriendsSnippets)
  const snippets = data?.pages?.flatMap((p) => p.items) ?? []

  return (
    <React.Fragment>
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-xl">
          Friends' Snippets
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Sort by: Recent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {snippets.map((snippet) => (
          <Card
            key={snippet.id}
            className="border-border hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-heading">
                    {snippet.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {snippet.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={snippet.friend.image || '/placeholder.svg'}
                    alt={snippet.friend.name}
                  />
                  <AvatarFallback>
                    {snippet.friend.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  by{' '}
                  {snippet.friend.firstName.concat(
                    ' ',
                    snippet.friend.lastName,
                  )}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs font-mono ml-auto"
                >
                  {snippet.language}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm overflow-hidden border">
                <pre className="text-foreground whitespace-pre-wrap line-clamp-6 text-xs leading-relaxed">
                  {snippet.code}
                </pre>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">
                  {snippet.createdAt?.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-3 flex-wrap">
                {snippet.tags.map((tag) => (
                  <Badge key={tag.name} variant="outline" className="text-xs">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </React.Fragment>
  )
}
