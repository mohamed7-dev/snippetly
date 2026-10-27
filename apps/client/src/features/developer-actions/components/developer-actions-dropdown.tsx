import { Button } from '@/components/ui/button';
import { UpdateProfileIcon } from '@/components/shared/creation-icons';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { SignInDropdownMenuItem } from '@/features/auth/components/shared/sign-in-dropdown-menu-item';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AddToFavouritesButton } from '@/features/favourites/components/shared/add-to-favourites-button';
import { RemoveFromFavouritesButton } from '@/features/favourites/components/shared/remove-from-favourites-button';
import type { AddToFavouritesMutationCallbacks } from '@/features/favourites/hooks/use-favourite-mutation';
import { favouriteDevelopersQueryOptions } from '@/features/favourites/lib/favourites-query-options';
import { AcceptFriendshipRequestButton } from '@/features/friendship/components/accept-friendship-request-button';
import { CancelFriendshipRequestButton } from '@/features/friendship/components/cancel-friendship-request-button';
import { RejectFriendshipRequestButton } from '@/features/friendship/components/reject-friendship-request-buttton';
import { SendFriendshipRequestButton } from '@/features/friendship/components/send-friendship-request-button';
import type { AcceptFriendshipRequestMutationCallbacks } from '@/features/friendship/hooks/use-accept-friendship-request';
import type { CancelFriendshipRequestMutationCallbacks } from '@/features/friendship/hooks/use-cancel-friendship-request';
import type { RejectFriendshipRequestMutationCallbacks } from '@/features/friendship/hooks/use-reject-friendship-request';
import type { SendFriendshipRequestMutationCallbacks } from '@/features/friendship/hooks/use-send-friendship-request';
import { FriendshipStatus, Permission } from '@snippetly/common/dto';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import { EyeIcon, MoreHorizontalIcon } from 'lucide-react';
import React from 'react';

export interface DeveloperFriendshipInfo {
    isFriendWithCurrentUser: boolean;
    friendshipStatus: FriendshipStatus | null;
}

export interface DeveloperFavouriteInfo {
    isFavouritedByCurrentUser: boolean;
}

export interface DeveloperActionsDropdownProps {
    developer: { id: string; firstName: string };
    friendshipInfo: DeveloperFriendshipInfo;
    favouriteInfo: DeveloperFavouriteInfo;
    showRequestFriendship?: boolean;
    showAcceptFriendshipRequest?: boolean;
    showRejectFriendshipRequest?: boolean;
    showCancelFriendshipRequest?: boolean;
    showAddToFavourites?: boolean;
    showRemoveFromFavourites?: boolean;
    showViewProfile?: boolean;
    showEditProfile?: boolean;
    addDeveloperToFavourites?: AddToFavouritesMutationCallbacks;
    removeDeveloperFromFavourites?: AddToFavouritesMutationCallbacks;
    sendFriendshipRequest?: SendFriendshipRequestMutationCallbacks;
    acceptFriendshipRequest?: AcceptFriendshipRequestMutationCallbacks;
    rejectFriendshipRequest?: RejectFriendshipRequestMutationCallbacks;
    cancelFriendshipRequest?: CancelFriendshipRequestMutationCallbacks;
}

export function DeveloperActionsDropdown({
    developer,
    friendshipInfo,
    favouriteInfo,
    addDeveloperToFavourites,
    removeDeveloperFromFavourites,
    sendFriendshipRequest,
    acceptFriendshipRequest,
    rejectFriendshipRequest,
    cancelFriendshipRequest,
    showRequestFriendship = false,
    showAcceptFriendshipRequest = false,
    showRejectFriendshipRequest = false,
    showCancelFriendshipRequest = false,
    showAddToFavourites = false,
    showRemoveFromFavourites = false,
    showViewProfile = false,
    showEditProfile = false,
}: DeveloperActionsDropdownProps) {
    const [open, setOpen] = React.useState(false);
    const queryClient = useQueryClient();
    const { status } = useAuth();
    const location = useLocation();
    const hasPendingRequest = friendshipInfo.friendshipStatus === FriendshipStatus.Pending;
    const canRequestFriendship =
        !friendshipInfo.isFriendWithCurrentUser &&
        !hasPendingRequest &&
        (showCancelFriendshipRequest || showRequestFriendship);
    const canRespondToRequest =
        hasPendingRequest &&
        !friendshipInfo.isFriendWithCurrentUser &&
        (showAcceptFriendshipRequest || showRejectFriendshipRequest);

    const canAddToFav = favouriteInfo.isFavouritedByCurrentUser === false;
    const canRemoveFromFav = favouriteInfo.isFavouritedByCurrentUser === true;

    const hasProfileActions = showViewProfile || showEditProfile;
    const hasFriendshipActions = canRequestFriendship || canRespondToRequest;

    const hasFavouriteActions =
        (showAddToFavourites && canAddToFav) || (showRemoveFromFavourites && canRemoveFromFav);

    const invalidateFriendshipData = () => {
        setOpen(false);
    };

    const invalidateFavData = () => {
        setOpen(false);
        void queryClient.invalidateQueries(favouriteDevelopersQueryOptions());
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" aria-label={`Actions for ${developer.firstName}`}>
                    <MoreHorizontalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {hasProfileActions && (
                    <DropdownMenuGroup>
                        {showViewProfile && (
                            <DropdownMenuItem asChild>
                                <Button variant="ghost" className="w-full justify-start" asChild>
                                    <Link to="/developers/$id" params={{ id: developer.id }}>
                                        <EyeIcon />
                                        View Profile
                                    </Link>
                                </Button>
                            </DropdownMenuItem>
                        )}
                        {showEditProfile && (
                            <PermissionGuard
                                requiredPermissions={[
                                    Permission.Authenticated,
                                    Permission.UpdateDeveloper,
                                    Permission.Owner,
                                ]}
                                ownerId={developer.id}
                            >
                                <DropdownMenuItem asChild>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <Link to="/dashboard/settings/account">
                                            <UpdateProfileIcon className="size-4" />
                                            Edit Profile
                                        </Link>
                                    </Button>
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                    </DropdownMenuGroup>
                )}

                {hasFriendshipActions && (
                    <DropdownMenuGroup>
                        {canRequestFriendship && (
                            <PermissionGuard
                                requiredPermissions={[Permission.Authenticated]}
                                ownerId={developer.id}
                                preventOwner={true}
                            >
                                <DropdownMenuItem onSelect={event => event.preventDefault()} asChild>
                                    <SendFriendshipRequestButton
                                        friendId={developer.id}
                                        label="Request Friendship"
                                        variant="ghost"
                                        type="button"
                                        className="w-full justify-start"
                                        sendFriendshipRequestMutationCallbacks={{
                                            ...sendFriendshipRequest,
                                            onSuccess: data => {
                                                invalidateFriendshipData();
                                                sendFriendshipRequest?.onSuccess?.(data);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                        {canRespondToRequest && showAcceptFriendshipRequest && (
                            <PermissionGuard
                                requiredPermissions={[Permission.Authenticated]}
                                ownerId={developer.id}
                                preventOwner={true}
                            >
                                <DropdownMenuItem onSelect={event => event.preventDefault()} asChild>
                                    <AcceptFriendshipRequestButton
                                        friendId={developer.id}
                                        label="Accept Request"
                                        variant="ghost"
                                        type="button"
                                        className="w-full justify-start"
                                        acceptFriendshipRequestMutationCallbacks={{
                                            ...acceptFriendshipRequest,
                                            onSuccess: data => {
                                                invalidateFriendshipData();
                                                acceptFriendshipRequest?.onSuccess?.(data);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                        {canRespondToRequest && showRejectFriendshipRequest && (
                            <PermissionGuard
                                requiredPermissions={[Permission.Authenticated]}
                                ownerId={developer.id}
                                preventOwner={true}
                            >
                                <DropdownMenuItem onSelect={event => event.preventDefault()} asChild>
                                    <RejectFriendshipRequestButton
                                        friendId={developer.id}
                                        label="Reject Request"
                                        variant="ghost"
                                        type="button"
                                        className="w-full justify-start"
                                        rejectFriendshipRequestMutationCallbacks={{
                                            ...rejectFriendshipRequest,
                                            onSuccess: data => {
                                                invalidateFriendshipData();
                                                rejectFriendshipRequest?.onSuccess?.(data);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                        {canRequestFriendship && showCancelFriendshipRequest && (
                            <PermissionGuard
                                requiredPermissions={[Permission.Authenticated]}
                                ownerId={developer.id}
                                preventOwner={true}
                            >
                                <DropdownMenuItem onSelect={event => event.preventDefault()} asChild>
                                    <CancelFriendshipRequestButton
                                        friendId={developer.id}
                                        label="Cancel Request"
                                        variant="ghost"
                                        type="button"
                                        className="w-full justify-start"
                                        cancelFriendshipRequestMutationCallbacks={{
                                            ...cancelFriendshipRequest,
                                            onSuccess: data => {
                                                invalidateFriendshipData();
                                                cancelFriendshipRequest?.onSuccess?.(data);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                    </DropdownMenuGroup>
                )}
                {hasFavouriteActions && (
                    <DropdownMenuGroup>
                        {showAddToFavourites && canAddToFav && (
                            <PermissionGuard
                                requiredPermissions={[Permission.Authenticated]}
                                ownerId={developer.id}
                                preventOwner={true}
                            >
                                <DropdownMenuItem onSelect={event => event.preventDefault()} asChild>
                                    <AddToFavouritesButton
                                        resourceType="developers"
                                        resourceId={developer.id}
                                        variant="ghost"
                                        type="button"
                                        className="w-full justify-start"
                                        mutationCallbacks={{
                                            ...addDeveloperToFavourites,
                                            onSuccess: data => {
                                                invalidateFavData();
                                                addDeveloperToFavourites?.onSuccess?.(data);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                        {showRemoveFromFavourites && canRemoveFromFav && (
                            <PermissionGuard
                                requiredPermissions={[Permission.Authenticated]}
                                ownerId={developer.id}
                                preventOwner={true}
                            >
                                <DropdownMenuItem onSelect={event => event.preventDefault()} asChild>
                                    <RemoveFromFavouritesButton
                                        resourceType="developers"
                                        resourceId={developer.id}
                                        variant="ghost"
                                        type="button"
                                        className="w-full justify-start"
                                        mutationCallbacks={{
                                            ...removeDeveloperFromFavourites,
                                            onSuccess: data => {
                                                invalidateFavData();
                                                removeDeveloperFromFavourites?.onSuccess?.(data);
                                            },
                                        }}
                                    />
                                </DropdownMenuItem>
                            </PermissionGuard>
                        )}
                    </DropdownMenuGroup>
                )}
                {status === 'unauthenticated' && (
                    <DropdownMenuGroup>
                        <SignInDropdownMenuItem redirect={location.href} />
                    </DropdownMenuGroup>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
