import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Code2Icon, EyeIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react'
import { getCurrentUserFriends } from '../../lib/api'
import React from 'react'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'

export function FriendsTabContent() {
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(getCurrentUserFriends)
  const friends = data.pages?.flatMap((p) => p.items) ?? []
  return (
    <React.Fragment>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend) => (
          <Card
            key={friend.id}
            className="border-border hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={friend.image || '/placeholder.svg'}
                      alt={friend.name}
                    />
                    <AvatarFallback>
                      {friend.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-heading">
                      {friend.firstName.concat(' ', friend.lastName)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      @{friend.name}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Button variant={'ghost'} asChild>
                        <Link
                          to="/profile/$name"
                          params={{ name: friend.name }}
                        >
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Profile
                        </Link>
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground text-pretty">
                {friend.bio}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold">
                    {friend.snippetsCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Snippets</p>
                </div>
              </div>

              {friend.recentSnippets?.length && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Recent Snippets
                  </p>
                  {friend.recentSnippets?.map((snippet, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate flex-1">{snippet.title}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs font-mono">
                          {snippet.language}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button size="sm" variant="outline">
                  View Snippets
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <InfiniteLoader
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        Content={
          !friends.length ? (
            <div className="text-center py-12">
              <Code2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                No friends yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first friend to start learning from others.
              </p>
              <Button asChild>
                <Link to="/dashboard/discover">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  <span>Discover Developers</span>
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
    </React.Fragment>
  )
}
