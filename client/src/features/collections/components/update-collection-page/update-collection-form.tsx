import { useUpdateCollection } from '../../hooks/use-update-collection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { UpdateCollectionSchema } from '../../lib/schema'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { TagsField } from './tags-field'
import React from 'react'
import { PageLoader } from '@/components/loaders/page-loader'
import { ColorField } from '../shared/color-field'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback'

export const UPDATE_COLLECTION_FORM_NAME = 'update-collection-form'

export function UpdateCollectionForm() {
  const { slug } = useParams({
    from: '/(protected)/dashboard/collections/$slug/edit',
  })
  // form
  const updateCollectionForm: UseFormReturn<UpdateCollectionSchema> =
    useFormContext()

  // update action
  const {
    mutateAsync: updateCollection,
    isPending,
    reset,
  } = useUpdateCollection({
    onSuccess: (data) => {
      toast.success(data.message)
      updateCollectionForm.reset()
      reset()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async ({ isPublic, ...values }: UpdateCollectionSchema) => {
    await updateCollection({
      slug,
      data: { ...values, isPrivate: !isPublic },
    })
  }

  return (
    <form
      autoComplete="off"
      onSubmit={updateCollectionForm.handleSubmit(onSubmit)}
      className="space-y-6"
      id={UPDATE_COLLECTION_FORM_NAME}
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Collection Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={updateCollectionForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
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
            control={updateCollectionForm.control}
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
              control={updateCollectionForm.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 h-10 px-3 py-2 border border-border rounded-md bg-input">
                  <FormControl>
                    <Switch
                      disabled={isPending}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Make collection public</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
        <React.Suspense fallback={<PageLoader />}>
          <TagsField />
        </React.Suspense>
      </ErrorBoundary>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={updateCollectionForm.control}
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
    </form>
  )
}
