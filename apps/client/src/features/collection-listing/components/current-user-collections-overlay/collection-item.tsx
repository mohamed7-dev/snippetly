import { Button } from '@/components/ui/button';
import type { ApiSuccess } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { CurrentUserCollectionListDtoType } from '@snippetly/common/dto';
import type { CurrentUserCollectionsOverlayProps } from '.';

type CollectionItemProps = {
    collection: ApiSuccess<CurrentUserCollectionListDtoType['output']>['items'][number];
    onSelect: CurrentUserCollectionsOverlayProps['onSelect'];
    selectedItemId?: string;
};
export function CollectionItem({ collection, onSelect, selectedItemId }: CollectionItemProps) {
    const isSelected = selectedItemId === collection.id;

    return (
        <article
            className={cn(
                'flex items-center justify-between px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted',
                isSelected && 'border-2 border-secondary',
            )}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`size-4 rounded-full`}
                    style={{
                        backgroundColor: collection.color,
                    }}
                />
                <span className="flex-1">{collection.name}</span>
            </div>
            <Button className="rounded-full" onClick={() => onSelect(collection.id, collection.name)}>
                {isSelected ? 'Selected' : 'Select'}
            </Button>
        </article>
    );
}
