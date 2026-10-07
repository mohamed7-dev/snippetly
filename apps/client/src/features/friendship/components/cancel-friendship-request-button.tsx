import { LoadingButton } from '@/components/inputs/loading-button';
import { CheckIcon } from 'lucide-react';
import type React from 'react';
import {
    useCancelFriendshipRequest,
    type CancelFriendshipRequestMutationCallbacks,
} from '../hooks/use-cancel-friendship-request';

interface CancelFriendshipRequestButtonProps extends Omit<
    React.ComponentProps<typeof LoadingButton>,
    'isLoading'
> {
    label?: string;
    friendId: string;
    isLoading?: boolean;
    cancelFriendshipRequestMutationCallbacks?: CancelFriendshipRequestMutationCallbacks;
}

export function AcceptFriendshipRequestButton({
    label = 'cancel request',
    onClick,
    friendId,
    cancelFriendshipRequestMutationCallbacks,
    ...props
}: CancelFriendshipRequestButtonProps) {
    const { isPending, mutateAsync } = useCancelFriendshipRequest(cancelFriendshipRequestMutationCallbacks);

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
