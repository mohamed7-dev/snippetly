import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ClockIcon, UserPlusIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUserOutbox } from '../../lib/api'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { LoadingButton } from '@/components/inputs/loading-button'
import { useCancelFriendshipRequest } from '../../hooks/use-cancel-friendship-request'
import { toast } from 'sonner'

export function OutboxTabContent() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(getCurrentUserOutbox)
  const users = data?.pages?.flatMap((p) => p.items) ?? []

  const qClient = useQueryClient()
  const { mutateAsync: cancelRequest, isPending: isCancelling } =
    useCancelFriendshipRequest({
      onSuccess: (data) => {
        toast.success(data.message)
        // update user dashboard info to reflect stats
        qClient.invalidateQueries({
          queryKey: ['users', 'current', 'dashboard'],
        })
      },
      onError: (err) => {
        toast.error(err.response?.data.message)
      },
    })
  return (
    <React.Fragment>
      <div className="space-y-4">
        {users.map((request) => (
          <Card
            key={request.username}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 relative pt-6">
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/profile/$name`}
                      params={{ name: request.username }}
                      className="font-semibold hover:text-primary"
                    >
                      {request.fullName}
                    </Link>
                    <Badge
                      variant="secondary"
                      className="text-xs absolute top-0 right-0"
                    >
                      Sent{' '}
                      {new Date(request.requestSentAt)?.toLocaleDateString()}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    @{request.username}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.bio}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground font-bold">
                  <span>{request.snippetsCount} snippets</span>
                </div>

                <div className="flex gap-2">
                  <LoadingButton
                    isLoading={isCancelling}
                    size="sm"
                    variant="destructive-outline"
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
