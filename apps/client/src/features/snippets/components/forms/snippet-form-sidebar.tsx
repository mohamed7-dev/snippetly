import { TagsEditor } from '@/components/shared/tags-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { CurrentUserCollectionsOverlay } from '@/features/collection-listing/components/current-user-collections-overlay';
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

    const [isCollectionsDialogOpen, setIsCollectionsDialogOpen] = React.useState(false);

    // Select Collection
    const [SelectedCollectionName, setSelectedCollectionName] = React.useState(selectedCollectionName);
    const onSelectingCollection = (collectionId: string, collectionName: string) => {
        form.setValue('collectionId', collectionId);
        setIsCollectionsDialogOpen(false);
        setSelectedCollectionName(collectionName);
    };

    return (
        <div className="space-y-6">
            <TagsEditor disabled={isPending} />

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
                                    createCollectionRedirect="/dashboard/snippets/new"
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
