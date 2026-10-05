import { LoadingButton } from '@/components/inputs/loading-button';
import { UsersIcon } from 'lucide-react';
import type React from 'react';
import {
    useSendFriendshipRequest,
    type SendFriendshipRequestMutationCallbacks,
} from '../hooks/use-send-friendship-request';

interface SendFriendshipRequestButtonProps extends Omit<
    React.ComponentProps<typeof LoadingButton>,
    'isLoading'
> {
    label?: string;
    friendId: string;
    isLoading?: boolean;
    sendFriendshipRequestMutationCallbacks?: SendFriendshipRequestMutationCallbacks;
}

export function SendFriendshipRequestButton({
    label = 'add friend',
    onClick,
    friendId,
    sendFriendshipRequestMutationCallbacks,
    ...props
}: SendFriendshipRequestButtonProps) {
    const { isPending, mutateAsync } = useSendFriendshipRequest(sendFriendshipRequestMutationCallbacks);

    const handleSending = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            await mutateAsync({ friendId });
        }
    };

    return (
        <LoadingButton
            variant="outline"
            {...props}
            isLoading={isPending || (props?.isLoading ? props.isLoading : isPending)}
            onClick={handleSending}
        >
            <UsersIcon className="h-4 w-4 mr-2" />
            {label}
        </LoadingButton>
    );
}
