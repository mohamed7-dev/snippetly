import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';
import {
    type AddToFavouritesMutationCallbacks,
    type FavouriteResourceType,
    useAddToFavourites,
} from '../../hooks/use-favourite-mutation';

interface AddToFavouritesButtonProps extends React.ComponentProps<typeof Button> {
    label?: string;
    mutationCallbacks?: AddToFavouritesMutationCallbacks;
    resourceType: FavouriteResourceType;
    resourceId: string;
}

export function AddToFavouritesButton({
    resourceType,
    resourceId,
    label = 'Add to favourites',
    onClick,
    mutationCallbacks,
    ...props
}: AddToFavouritesButtonProps) {
    const mutation = useAddToFavourites(mutationCallbacks);

    const handleAddingToFav = async (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.isDefaultPrevented()) {
            await mutation.mutateAsync({ resourceType, id: resourceId });
        }
    };
    return (
        <Button {...props} disabled={mutation.isPending} onClick={handleAddingToFav}>
            <HeartIcon />
            {label}
        </Button>
    );
}
