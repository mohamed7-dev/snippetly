import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { CreateSnippetSchema } from '../../lib/schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { LANGUAGES } from '../../lib/data'
import { Sidebar } from './sidebar'
import { useCreateSnippet } from '../../hooks/use-create-snippet'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { CodeEditorField } from '../shared/code-editor-field'

export const CREATE_SNIPPET_FORM = 'create-snippet-form'
export function CreateSnippetForm() {
  const createSnippetForm: UseFormReturn<CreateSnippetSchema> = useFormContext()
  const navigate = useNavigate()

  const {
    mutateAsync: createSnippet,
    isPending,
    reset,
  } = useCreateSnippet({
    onSuccess: (data) => {
      toast.success(data.message)
      createSnippetForm.reset()
      reset()
      navigate({
        from: '/dashboard/snippets/new',
        to: '/dashboard/snippets/$slug',
        params: { slug: data.data.slug },
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (values: CreateSnippetSchema) => {
    await createSnippet(values)
  }
  return (
    <form
      autoComplete="off"
      id={CREATE_SNIPPET_FORM}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      onSubmit={createSnippetForm.handleSubmit(onSubmit)}
    >
      {/* main form fields  */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Snippet Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={createSnippetForm.control}
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
              control={createSnippetForm.control}
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={createSnippetForm.control}
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
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                  control={createSnippetForm.control}
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
          <CardContent className="space-y-4">
            <CodeEditorField />
            <FormField
              control={createSnippetForm.control}
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
      <Sidebar />
    </form>
  )
}
