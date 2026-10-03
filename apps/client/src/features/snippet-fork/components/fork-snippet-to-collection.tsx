import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { CurrentUserCollectionsOverlay } from '@/features/collection-listing/components/current-user-collections-overlay';
import React from 'react';
import { useForkSnippet, type ForkSnippetMutationCallbacks } from '../hooks/use-fork-snippet';
import { ForkSnippetButton } from './fork-snippet-button';

export function ForkSnippetToCollection({
    triggerAs,
    snippetId,
    asyncActionCallbacks,
}: {
    triggerAs: 'button' | 'dropdown';
    snippetId: string;
    asyncActionCallbacks?: ForkSnippetMutationCallbacks;
}) {
    const [isCollectionsOverlayOpen, setIsCollectionsOverlayOpen] = React.useState(false);
    const { isPending, mutateAsync } = useForkSnippet({
        ...asyncActionCallbacks,
        onSuccess: (...props) => {
            setIsCollectionsOverlayOpen(false);
            asyncActionCallbacks?.onSuccess?.(...props);
        },
    });

    return (
        <>
            {triggerAs === 'dropdown' ? (
                <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                    <ForkSnippetButton
                        isLoading={isPending}
                        className="justify-start"
                        label="fork to collection"
                        snippetId={snippetId}
                        onClick={e => {
                            e.preventDefault();
                            setIsCollectionsOverlayOpen(true);
                        }}
                    />
                </DropdownMenuItem>
            ) : (
                <ForkSnippetButton
                    isLoading={isPending}
                    label="fork to collection"
                    snippetId={snippetId}
                    onClick={e => {
                        e.preventDefault();
                        setIsCollectionsOverlayOpen(true);
                    }}
                />
            )}
            <CurrentUserCollectionsOverlay
                isOpen={isCollectionsOverlayOpen}
                onOpenChange={setIsCollectionsOverlayOpen}
                onSelect={collectionId => mutateAsync({ collectionId, id: snippetId })}
            />
        </>
    );
}
