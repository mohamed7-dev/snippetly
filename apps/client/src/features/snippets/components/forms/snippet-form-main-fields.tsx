import { RichTextInput } from '@/components/inputs/rich-text-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SlugInput } from '@/features/slug/components/slug-input';
import React from 'react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import { LANGUAGES } from '../../lib/data';
import type { SnippetFormSchema } from '../../lib/schema';
import { SnippetFormCode } from './snippet-form-code';

export function SnippetFormMainFields({ isPending, snippetId }: { isPending: boolean; snippetId?: string }) {
    const form: UseFormReturn<SnippetFormSchema> = useFormContext();
    return (
        <React.Fragment>
            <Card>
                <CardHeader>
                    <CardTitle className="font-heading">Snippet Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending}
                                            placeholder="Enter snippet name..."
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
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <SlugInput
                                            disabled={isPending}
                                            placeholder="Enter snippet slug..."
                                            entityName="Snippet"
                                            entityId={snippetId}
                                            watchFieldName="name"
                                            fieldName="slug"
                                            {...field}
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
                                        placeholder="Describe what this snippet does..."
                                        rows={3}
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Language</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-input border-border w-full">
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="w-full">
                                            {LANGUAGES.map(lang => (
                                                <SelectItem key={lang.value} value={lang.value}>
                                                    {lang.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="visibility">Visibility</Label>
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
                                        <FormLabel>Make snippet private</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Snippet Code Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SnippetFormCode />
                    <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Note</FormLabel>
                                <FormControl>
                                    <RichTextInput
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        isDisabled={isPending}
                                        placeholder="Describe the code in the snippet..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </React.Fragment>
    );
}
