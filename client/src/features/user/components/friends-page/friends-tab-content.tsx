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
import { EyeIcon, MoreHorizontalIcon } from 'lucide-react'
import { getCurrentUserFriends } from '../../lib/api'

export function FriendsTabContent() {
  const { data } = useSuspenseInfiniteQuery(getCurrentUserFriends)
  const friends = data.pages?.flatMap((p) => p.items) ?? []
  return (
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
                    <Button asChild>
                      <Link to="/profile/$name" params={{ name: friend.name }}>
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
                <p className="text-lg font-semibold">{friend.snippetsCount}</p>
                <p className="text-xs text-muted-foreground">Snippets</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Recent Snippets
              </p>
              {friend.recentSnippets.map((snippet, index) => (
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

            <div className="flex items-center justify-between pt-2">
              <Button size="sm" variant="outline">
                View Snippets
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
