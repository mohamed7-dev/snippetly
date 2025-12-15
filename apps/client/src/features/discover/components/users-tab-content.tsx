import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Code2Icon } from 'lucide-react'
import React from 'react'
import { discoverUsersQueryOptions } from '../lib/api'

export function UsersTabContent() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(discoverUsersQueryOptions)
  const users = data.pages?.flatMap((p) => p.data.items) ?? []

  return (
    <React.Fragment>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.image || '/placeholder.svg'}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      to={'/profile/$name'}
                      params={{ name: user.name }}
                      className="font-semibold hover:text-primary"
                    >
                      {user.firstName || user.lastName || user.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      @{user.name}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  joined {new Date(user.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{user.bio}</p>

              <div className="flex gap-4 text-sm">
                <span>
                  <strong>{user.snippetsCount}</strong> snippet
                  {user.snippetsCount !== 1 ? 's' : ''}
                </span>
                <span>
                  <strong>{user.friendsCount}</strong> friend
                  {user.friendsCount !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {user.tags?.map((tag) => (
                  <Badge key={tag.name} variant="secondary" className="text-xs">
                    {tag.name}
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
        Content={
          !users.length ? (
            <div className="text-center py-12">
              <Code2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                No users found.
              </h3>
            </div>
          ) : null
        }
      />
    </React.Fragment>
  )
}
