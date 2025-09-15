import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { discoverUsersQueryOptions } from '../lib/api'

export function UsersTabContent() {
  // use suspense to load users
  const { data } = useSuspenseInfiniteQuery(discoverUsersQueryOptions)
  const users = data.pages?.flatMap((p) => p.items) ?? []

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
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
                    {user.firstName.concat('', user.lastName)}
                  </Link>
                  <p className="text-sm text-muted-foreground">@{user.name}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{user.bio}</p>

            <div className="flex gap-4 text-sm">
              <span>
                <strong>{user.snippetsCount}</strong> snippets
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {user.recentTags.map((tag) => (
                <Badge key={tag.name} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
