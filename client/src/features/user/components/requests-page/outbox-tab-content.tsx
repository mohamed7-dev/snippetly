import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ClockIcon, UserPlusIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getCurrentUserOutbox } from '../../lib/api'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { LoadingButton } from '@/components/inputs/loading-button'
import { useCancelFriendshipRequest } from '../../hooks/use-cancel-friendship-request'

export function OutboxTabContent() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(getCurrentUserOutbox)
  const users = data?.pages?.flatMap((p) => p.items) ?? []
  const { mutateAsync: cancelRequest, isPending: isCancelling } =
    useCancelFriendshipRequest()
  return (
    <React.Fragment>
      <div className="space-y-4">
        {users.map((request) => (
          <Card
            key={request.username}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={request.image || '/placeholder.svg'}
                    alt={request.username}
                  />
                  <AvatarFallback>
                    {request.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/$name`}
                        params={{ name: request.username }}
                        className="font-semibold hover:text-primary"
                      >
                        {request.firstName.concat(' ', request.lastName)}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        @{request.username}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Sent{' '}
                        {new Date(request.requestSentAt)?.toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {request.bio}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{request.snippetsCount} snippets</span>
                  </div>

                  <div className="flex gap-2">
                    <LoadingButton
                      isLoading={isCancelling}
                      size="sm"
                      variant="outline"
                      disabled={isCancelling}
                      onClick={() =>
                        cancelRequest({ friendName: request.username })
                      }
                    >
                      <XIcon className="h-4 w-4 mr-1" />
                      Cancel Request
                    </LoadingButton>
                    <Link
                      to={`/profile/$name`}
                      params={{ name: request.username }}
                    >
                      <Button size="sm" variant="ghost">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
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
              <ClockIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sent Requests</h3>
              <p className="text-muted-foreground mb-4">
                You haven't sent any friend requests recently.
              </p>
              <Button asChild>
                <Link to="/dashboard/discover">
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Find People to Connect
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
    </React.Fragment>
  )
}
