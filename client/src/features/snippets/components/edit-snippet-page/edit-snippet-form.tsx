import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { EditSnippetSchema } from '../../lib/schema'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANGUAGES } from '../../lib/data'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CodeEditorField } from '../shared/code-editor-field'
import { useUpdateSnippet } from '../../hooks/use-update-snippet'
import { useParams, useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Sidebar } from './sidebar'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getSnippetQueryOptions } from '../../lib/api'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/feedback/error-boundary-fallback'
import React from 'react'
import { PageLoader } from '@/components/loaders/page-loader'

export const EDIT_SNIPPET_FORM_NAME = 'edit-snippet-form'

export function EditSnippetForm() {
  const editSnippetForm: UseFormReturn<EditSnippetSchema> = useFormContext()
  // initial snippet
  const { slug } = useParams({
    from: '/(protected)/dashboard/snippets/$slug/edit',
  })
  const { queryClient } = useRouteContext({
    from: '/(protected)/dashboard/snippets/$slug/edit',
  })
  const {
    data: { data: initialSnippet },
  } = useSuspenseQuery(getSnippetQueryOptions(slug))
  const initialCollection = initialSnippet.collection

  const {
    mutateAsync: updateSnippet,
    reset,
    isPending,
  } = useUpdateSnippet({
    onSuccess: (data) => {
      toast.success(data.message)
      reset()
      queryClient.invalidateQueries({
        queryKey: ['snippets', data.data.publicId],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  const onSubmit = async ({
    collection,
    isPublic,
    ...rest
  }: EditSnippetSchema) => {
    const isCollectionChanged = collection !== initialCollection.publicId

    await updateSnippet({
      data: {
        ...rest,
        isPrivate: !isPublic,
        ...(isCollectionChanged ? { collection } : {}),
      },
      slug,
    })
  }

  return (
    <form
      autoComplete="off"
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      onSubmit={editSnippetForm.handleSubmit(onSubmit)}
      id={EDIT_SNIPPET_FORM_NAME}
    >
      {/* main form  */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Snippet Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={editSnippetForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Enter snippet title..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editSnippetForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder="Describe what this snippet does..."
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={editSnippetForm.control}
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
                        {LANGUAGES.map((lang) => (
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
                  control={editSnippetForm.control}
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-3">
            <CodeEditorField />
            <FormField
              control={editSnippetForm.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder="Describe the code in the snippet..."
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* sidebar  */}
      <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
        <React.Suspense fallback={<PageLoader />}>
          <Sidebar />
        </React.Suspense>
      </ErrorBoundary>
    </form>
  )
}
