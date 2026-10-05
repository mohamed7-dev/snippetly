import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { SendFriendshipRequestButton } from '@/features/friendship/components/send-friendship-request-button';
import { FriendshipStatus } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { CalendarIcon } from 'lucide-react';
import { getDeveloperProfileQueryOptions } from '../../lib/public-profile-query-options';

export function ProfilePageInfo() {
    const { id } = useParams({ from: '/(public)/profile/$id' });
    const { data: profile } = useSuspenseQuery(getDeveloperProfileQueryOptions(id));
    const { user } = useAuth();
    const qClient = useQueryClient();

    // isCurrentUserAFriend is always true as long as there is an interaction
    // whether it's accepted or not
    const friendshipInfo = 'friendshipInfo' in profile ? profile.friendshipInfo : undefined;
    const friendCount = 'friendCount' in profile ? profile.friendCount : 0;
    const shouldDisplayFriendshipInfo = !!friendshipInfo && (user?.id ? profile.id !== user.id : true);

    const shouldDisplaySendButton =
        friendshipInfo?.requestStatus === FriendshipStatus.Cancelled ||
        (friendshipInfo?.requestStatus !== FriendshipStatus.Pending && !friendshipInfo?.isCurrentUserAFriend);

    const avatarFallback = profile.firstName.slice(0, 1) + ' ' + profile.lastName.slice(0, 1);
    const fullName = profile.firstName + ' ' + profile.lastName;
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <Avatar className="h-32 w-32 mx-auto md:mx-0">
                        <AvatarImage src={profile.image || '/placeholder.svg'} alt={avatarFallback} />
                        <AvatarFallback className="text-2xl">{avatarFallback}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl capitalize font-bold">{fullName}</h1>
                        </div>
                        <p className="text-muted-foreground">{profile.bio}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                Joined {new Date(profile.createdAt).toLocaleDateString()}
                            </div>
                            <Badge variant="secondary">
                                {'isPrivate' in profile && profile?.isPrivate ? 'Private' : 'Public'}
                            </Badge>
                        </div>
                        <div className="flex gap-6 text-sm">
                            <span>
                                <strong>{friendCount}</strong> Friend
                                {friendCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {shouldDisplayFriendshipInfo && (
                            <div className="flex gap-2">
                                {shouldDisplaySendButton && (
                                    <div className="flex gap-2">
                                        <SendFriendshipRequestButton
                                            friendId={profile.id}
                                            sendFriendshipRequestMutationCallbacks={{
                                                onSuccess: () => {
                                                    qClient.invalidateQueries(
                                                        getDeveloperProfileQueryOptions(id),
                                                    );
                                                },
                                            }}
                                        />
                                    </div>
                                )}
                                {!!friendshipInfo?.requestStatus && (
                                    <Badge variant="secondary" className="capitalize">
                                        {friendshipInfo.requestStatus} Friendship Request
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
