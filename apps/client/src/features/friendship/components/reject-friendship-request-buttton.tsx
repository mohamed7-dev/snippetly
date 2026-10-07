import { LoadingButton } from '@/components/inputs/loading-button';
import { XIcon } from 'lucide-react';
import type React from 'react';
import {
    useRejectFriendshipRequest,
    type RejectFriendshipRequestMutationCallbacks,
} from '../hooks/use-reject-friendship-request';

interface RejectFriendshipRequestButtonProps extends Omit<
    React.ComponentProps<typeof LoadingButton>,
    'isLoading'
> {
    label?: string;
    friendId: string;
    isLoading?: boolean;
    rejectFriendshipRequestMutationCallbacks?: RejectFriendshipRequestMutationCallbacks;
}

export function RejectFriendshipRequestButton({
    label = 'reject request',
    onClick,
    friendId,
    rejectFriendshipRequestMutationCallbacks,
    ...props
}: RejectFriendshipRequestButtonProps) {
    const { isPending, mutateAsync } = useRejectFriendshipRequest(rejectFriendshipRequestMutationCallbacks);

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
            <XIcon className="h-4 w-4 mr-2" />
            {label}
        </LoadingButton>
    );
}
