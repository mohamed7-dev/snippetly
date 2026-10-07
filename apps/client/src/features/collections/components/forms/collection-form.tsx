import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SlugInput } from '@/features/slug/components/slug-input';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { useEnterTag } from '@/hooks/use-enter-tag';
import { type CreateCollectionDtoType } from '@snippetly/common/dto';
import { useQuery } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import React from 'react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import { ColorField } from './color-field';

export type CollectionFormSchemaType = CreateCollectionDtoType['input'];

export function CollectionForm({ isPending: isMutating }: { isPending: boolean }) {
    // form
    const form: UseFormReturn<CollectionFormSchemaType> = useFormContext();
    const tags = form.watch('tags');
    const isPending = isMutating || form.formState.isSubmitting;

    // tags
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = React.useState('');

    const handleTagChange = (tag: string) => {
        form.setValue('tags', [...(tags ?? []), tag]);
        setInputValue('');
    };
    useEnterTag({ tags, inputElem: inputRef, onValueChange: handleTagChange });

    const handleDeselectingTags = (tag: string) => {
        form.setValue(
            'tags',
            form.watch('tags')?.filter(t => t !== tag),
        );
    };

    const handleSelectingTags = (tag: string) => {
        // if found then return undefined
        const foundTag = tags?.find(t => t === tag);
        if (foundTag) return undefined;
        form.setValue('tags', [...(tags ?? []), tag]);
    };

    const { data } = useQuery(listPopularTagsQueryOptions());
    const popularTags = data?.items?.filter(t => !tags?.includes(t.value));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-heading">Collection Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Collection Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending}
                                            placeholder="Enter collection name..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Collection Slug</FormLabel>
                                    <FormControl>
                                        <SlugInput
                                            {...field}
                                            entityName="Collection"
                                            fieldName="slug"
                                            watchFieldName="name"
                                            disabled={isPending}
                                            placeholder="Enter collection name..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        disabled={isPending}
                                        placeholder="Describe what this collection contains..."
                                        className="resize-none"
                                        rows={4}
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <ColorField />

                    <div className="space-y-2">
                        <Label>Visibility</Label>
                        <FormField
                            control={form.control}
                            name="isPrivate"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 h-10 px-3 py-2 border border-border rounded-md bg-input">
                                    <FormControl>
                                        <Switch
                                            disabled={isPending}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel>Make collection private</FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

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
                        <div className="flex flex-wrap gap-2 min-h-8 p-2 border border-border rounded-md bg-input">
                            {form.watch('tags')?.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                    <Button
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

                    {!!popularTags?.length && (
                        <div className="space-y-2">
                            <Label>Popular Tags</Label>
                            <div className="flex flex-wrap gap-1">
                                {popularTags?.map(tag => (
                                    <Badge
                                        key={tag.value}
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
                    <CardTitle className="font-heading">Settings</CardTitle>
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
