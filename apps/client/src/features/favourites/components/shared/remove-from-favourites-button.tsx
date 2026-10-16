import { Button } from '@/components/ui/button';
import { HeartOffIcon } from 'lucide-react';
import {
    type FavouriteResourceType,
    type RemoveFromFavouritesMutationCallbacks,
    useRemoveFromFavourites,
} from '../../hooks/use-favourite-mutation';

interface RemoveFromFavouritesButtonProps extends React.ComponentProps<typeof Button> {
    label?: string;
    mutationCallbacks?: RemoveFromFavouritesMutationCallbacks;
    resourceType: FavouriteResourceType;
    resourceId: string;
}

export function RemoveFromFavouritesButton({
    resourceType,
    resourceId,
    label = 'Remove from favourites',
    onClick,
    mutationCallbacks,
    ...props
}: RemoveFromFavouritesButtonProps) {
    const mutation = useRemoveFromFavourites(mutationCallbacks);

    const handleAddingToFav = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            await mutation.mutateAsync({ resourceType, id: resourceId });
        }
    };
    return (
        <Button {...props} disabled={mutation.isPending} onClick={handleAddingToFav}>
            <HeartOffIcon />
            {label}
        </Button>
    );
}
