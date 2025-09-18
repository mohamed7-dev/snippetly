import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, UsersIcon } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getUserProfile } from '../../lib/api'
import { useParams } from '@tanstack/react-router'
import { useSendFriendshipRequest } from '../../hooks/use-send-friendship-request'
import { toast } from 'sonner'
import { LoadingButton } from '@/components/inputs/loading-button'

export function ProfileInfo() {
  const { name } = useParams({ from: '/(public)/profile/$name' })
  const { data } = useSuspenseQuery(getUserProfile(name))
  const profile = data.data.profile
  const stats = data.data.stats
  const {
    mutateAsync: sendRequest,
    isPending,
    reset,
  } = useSendFriendshipRequest({
    onSuccess: (data) => {
      toast.success(data.message)
      reset()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-32 w-32 mx-auto md:mx-0">
            <AvatarImage
              src={profile.image || '/placeholder.svg'}
              alt={profile.username}
            />
            <AvatarFallback className="text-2xl">
              {profile.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile.fullName}</h1>
              <p className="text-xl text-muted-foreground">
                @{profile.username}
              </p>
            </div>

            <p className="text-muted-foreground">{profile.bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Joined {new Date(profile.joinedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <span>
                <strong>{stats.friendsCount}</strong> friends
              </span>
            </div>

            {data.data?.isCurrentUserAFriend === false && (
              <div className="flex gap-2">
                <LoadingButton
                  isLoading={isPending}
                  variant="outline"
                  disabled={isPending}
                  onClick={() => sendRequest({ friendName: name })}
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Add Friend
                </LoadingButton>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
