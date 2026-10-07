import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CurrentUserCollectionsOverlay } from '@/features/collection-listing/components/current-user-collections-overlay';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { useEnterTag } from '@/hooks/use-enter-tag';
import { useSuspenseQuery } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import React from 'react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import type { SnippetFormSchema } from '../../lib/schema';

export function SnippetFormSidebar({
    isPending,
    selectedCollectionName,
}: {
    isPending: boolean;
    selectedCollectionName?: string;
}) {
    // Form
    const form: UseFormReturn<SnippetFormSchema> = useFormContext();

    // Select Tags
    const tags = form.watch('tags');
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = React.useState('');

    const handleTagChange = (tag: string) => {
        form.setValue('tags', [...(tags ?? []), tag]);
        setInputValue('');
    };
    useEnterTag({ tags, inputElem: inputRef, onValueChange: handleTagChange });
    const { data } = useSuspenseQuery(listPopularTagsQueryOptions());
    const popularTags = data.items.filter(tag => !tags?.includes(tag.value));

    const [isCollectionsDialogOpen, setIsCollectionsDialogOpen] = React.useState(false);

    const handleDeselectingTags = (tag: string) => {
        form.setValue(
            'tags',
            tags?.filter(t => t !== tag),
        );
    };

    const handleSelectingTags = (tag: string) => {
        const foundTag = tags?.find(t => t === tag);
        if (foundTag) return undefined;
        form.setValue('tags', [...(tags ?? []), tag]);
    };

    // Select Collection
    const [SelectedCollectionName, setSelectedCollectionName] = React.useState(selectedCollectionName);
    const onSelectingCollection = (collectionId: string, collectionName: string) => {
        form.setValue('collectionId', collectionId);
        setIsCollectionsDialogOpen(false);
        setSelectedCollectionName(collectionName);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-heading">Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tags">Add Tags</Label>
                        <Input
                            id="tags"
                            disabled={isPending}
                            placeholder="Type and press Enter..."
                            className="bg-input border-border"
                            ref={inputRef}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Press Enter to add tags</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Selected Tags</Label>
                        <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border border-border rounded-md bg-input">
                            {tags?.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        disabled={isPending}
                                        onClick={() => handleDeselectingTags(tag)}
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {!!popularTags.length && (
                        <div className="space-y-2">
                            <Label>Popular Tags</Label>
                            <div className="flex flex-wrap gap-1">
                                {popularTags?.map(tag => (
                                    <Badge
                                        key={tag.id}
                                        variant="outline"
                                        className="text-xs cursor-pointer hover:bg-primary/10"
                                        onClick={() => handleSelectingTags(tag.value)}
                                    >
                                        {tag.value}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-heading text-base">Collection</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="collectionId"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <Button type="button" onClick={() => setIsCollectionsDialogOpen(true)}>
                                        Select Collection
                                    </Button>
                                </FormControl>
                                <FormDescription>
                                    Selected Collection:{' '}
                                    <strong>{SelectedCollectionName ?? 'Not Organized'}</strong>
                                </FormDescription>

                                <CurrentUserCollectionsOverlay
                                    isOpen={isCollectionsDialogOpen}
                                    onOpenChange={setIsCollectionsDialogOpen}
                                    onSelect={(collectionId, collectionName) =>
                                        onSelectingCollection(collectionId, collectionName)
                                    }
                                    selectedCollectionId={form.getValues('collectionId')}
                                />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-heading text-base">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="allowForking"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                                <div>
                                    <FormLabel>Allow forking</FormLabel>
                                    <FormDescription className="text-xs text-muted-foreground">
                                        Let others create copies of this collection
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        disabled={isPending}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
