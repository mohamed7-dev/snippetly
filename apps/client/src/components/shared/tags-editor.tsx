import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { useEnterTag } from '@/hooks/use-enter-tag';
import { useQuery } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export function TagsEditor({ disabled = false }: { disabled?: boolean }) {
    const form = useFormContext<{ tags?: string[] }>();
    const tags = form.watch('tags');
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = React.useState('');
    const { data } = useQuery(listPopularTagsQueryOptions());
    const popularTags = data?.items.filter(tag => !tags?.includes(tag.value)) ?? [];

    const handleTagChange = (tag: string) => {
        form.setValue('tags', [...(tags ?? []), tag]);
        setInputValue('');
    };
    useEnterTag({ tags, inputElem: inputRef, onValueChange: handleTagChange });

    const handleDeselectingTag = (tag: string) => {
        form.setValue(
            'tags',
            tags?.filter(currentTag => currentTag !== tag),
        );
    };

    const handleSelectingTag = (tag: string) => {
        if (tags?.includes(tag)) return;
        form.setValue('tags', [...(tags ?? []), tag]);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-heading">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="tags">Add Tags</Label>
                    <Input
                        id="tags"
                        disabled={disabled}
                        placeholder="Type and press Enter..."
                        className="bg-input border-border"
                        ref={inputRef}
                        value={inputValue}
                        onChange={event => setInputValue(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Press Enter to add tags</p>
                </div>

                <div className="space-y-2">
                    <Label>Selected Tags</Label>
                    <div className="flex min-h-8 flex-wrap gap-2 rounded-md border border-border bg-input p-2">
                        {tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-1 h-4 w-4 p-0"
                                    disabled={disabled}
                                    aria-label={`Remove ${tag} tag`}
                                    onClick={() => handleDeselectingTag(tag)}
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
                            {popularTags.map(tag => (
                                <Badge
                                    key={tag.id}
                                    variant="outline"
                                    className="cursor-pointer text-xs hover:bg-primary/10"
                                    aria-label={`Add ${tag.value} tag`}
                                    onClick={() => handleSelectingTag(tag.value)}
                                >
                                    {tag.value}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
