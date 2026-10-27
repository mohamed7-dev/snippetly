import { TagsEditor } from '@/components/shared/tags-editor';
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
import { type CreateCollectionDtoType } from '@snippetly/common/dto';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import { ColorField } from './color-field';

export type CollectionFormSchemaType = CreateCollectionDtoType['input'];

export function CollectionForm({ isPending: isMutating }: { isPending: boolean }) {
    // form
    const form: UseFormReturn<CollectionFormSchemaType> = useFormContext();
    const isPending = isMutating || form.formState.isSubmitting;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-heading">Collection Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center flex-wrap gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex-1 min-w-52">
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
                                <FormItem className="flex-1 min-w-52">
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

            <TagsEditor disabled={isPending} />

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
