import { LoadingButton } from '@/components/inputs/loading-button';
import { CheckIcon } from 'lucide-react';
import type React from 'react';
import {
    useAcceptFriendshipRequest,
    type AcceptFriendshipRequestMutationCallbacks,
} from '../hooks/use-accept-friendship-request';

interface AcceptFriendshipRequestButtonProps extends Omit<
    React.ComponentProps<typeof LoadingButton>,
    'isLoading'
> {
    label?: string;
    friendId: string;
    isLoading?: boolean;
    acceptFriendshipRequestMutationCallbacks?: AcceptFriendshipRequestMutationCallbacks;
}

export function AcceptFriendshipRequestButton({
    label = 'accept request',
    onClick,
    friendId,
    acceptFriendshipRequestMutationCallbacks,
    ...props
}: AcceptFriendshipRequestButtonProps) {
    const { isPending, mutateAsync } = useAcceptFriendshipRequest(acceptFriendshipRequestMutationCallbacks);

    const handleSending = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            await mutateAsync({ friendId });
        }
    };

    return (
        <LoadingButton
            {...props}
            isLoading={isPending || (props?.isLoading ? props.isLoading : isPending)}
            onClick={handleSending}
        >
            <CheckIcon className="h-4 w-4 mr-2" />
            {label}
        </LoadingButton>
    );
}
