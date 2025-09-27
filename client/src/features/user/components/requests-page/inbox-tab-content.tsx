import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CheckIcon, MailIcon, UserPlusIcon, XIcon } from 'lucide-react'
import React from 'react'
import { getCurrentUserInbox } from '../../lib/api'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { useAcceptFriendshipRequest } from '../../hooks/use-accept-friendship-request'
import { useRejectFriendshipRequest } from '../../hooks/use-reject-friendship-request'
import { LoadingButton } from '@/components/inputs/loading-button'
import { toast } from 'sonner'
import { getCurrentUserDashboardOptions } from '@/features/dashboard/lib/api'

export function InboxTabContent() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(getCurrentUserInbox)
  const users = data.pages?.flatMap((p) => p.items) ?? []

  const qClient = useQueryClient()
  const { mutateAsync: acceptRequest, isPending: isAccepting } =
    useAcceptFriendshipRequest({
      onSuccess: (data) => {
        toast.success(data.message)
        qClient.invalidateQueries(getCurrentUserInbox)
        qClient.invalidateQueries(getCurrentUserDashboardOptions)
      },
      onError: (err) => {
        toast.error(err.response?.data.message)
      },
    })
  const { mutateAsync: rejectRequest, isPending: isRejecting } =
    useRejectFriendshipRequest({
      onSuccess: (data) => {
        toast.success(data.message)
        qClient.invalidateQueries(getCurrentUserInbox)
        qClient.invalidateQueries(getCurrentUserDashboardOptions)
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
            <CardContent className="space-y-4 p-3">
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

                <div className="flex gap-2 flex-wrap">
                  <LoadingButton
                    isLoading={isAccepting}
                    size="sm"
                    onClick={() =>
                      acceptRequest({ friendName: request.username })
                    }
                    disabled={isAccepting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckIcon className="h-4 w-4 sm:mr-1" />
                    Accept
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isRejecting}
                    disabled={isRejecting}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      rejectRequest({ friendName: request.username })
                    }
                  >
                    <XIcon className="h-4 w-4 sm:mr-1" />
                    Decline
                  </LoadingButton>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to={'/profile/$name'}
                      params={{ name: request.username }}
                    >
                      View
                    </Link>
                  </Button>
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
              <MailIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Incoming Requests
              </h3>
              <p className="text-muted-foreground mb-4">
                You don't have any pending friend requests at the moment.
              </p>
              <Button asChild>
                <Link to="/dashboard/discover">
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Discover Developers
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
    </React.Fragment>
  )
}
