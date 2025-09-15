import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import { type CreateCollectionSchema } from '../../lib/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PaletteIcon, XIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import { COLOR_OPTIONS } from '../../lib/data'
import React from 'react'
import { useCreateCollection } from '../../hooks/use-create-collection'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { useEnterTag } from '@/hooks/use-enter-tag'
import { cn } from '@/lib/utils'

export const CREATE_COLLECTION_FORM_NAME = 'create-collection-form'

export function CreateCollectionForm() {
  const { data } = useSuspenseQuery(getPopularTagsOptions)
  const popularTags = data.data
  const createCollectionForm: UseFormReturn<CreateCollectionSchema> =
    useFormContext()
  const tags = createCollectionForm.watch('tags')
  const navigate = useNavigate()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = React.useState('')

  const handleTagChange = (tag: string) => {
    createCollectionForm.setValue('tags', [...(tags ?? []), tag])
    setInputValue('')
  }
  useEnterTag({ tags, inputElem: inputRef, onValueChange: handleTagChange })

  const handleDeselectingTags = (tag: string) => {
    createCollectionForm.setValue(
      'tags',
      createCollectionForm.watch('tags')?.filter((t) => t !== tag),
    )
  }

  const handleSelectingTags = (tag: string) => {
    // if found then return undefined
    const foundTag = tags?.find((t) => t === tag)
    if (foundTag) return undefined
    createCollectionForm.setValue('tags', [...(tags ?? []), tag])
  }

  const {
    mutateAsync: createCollection,
    isPending,
    reset,
  } = useCreateCollection({
    onSuccess: (data) => {
      toast.success(data.message)
      createCollectionForm.reset()
      reset()
      navigate({
        from: '/dashboard/collections/new',
        to: '/dashboard/collections/$slug',
        params: { slug: data.data.slug },
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (values: CreateCollectionSchema) => {
    await createCollection(values)
  }

  return (
    <form
      autoComplete="off"
      onSubmit={createCollectionForm.handleSubmit(onSubmit)}
      className="space-y-6"
      id={CREATE_COLLECTION_FORM_NAME}
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Collection Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={createCollectionForm.control}
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
            control={createCollectionForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isPending}
                    placeholder="Describe what this collection contains..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createCollectionForm.control}
            name="color"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2">
                  <PaletteIcon className="h-4 w-4" />
                  Collection Color
                </FormLabel>
                <ToggleGroup
                  value={field.value}
                  onValueChange={(val) =>
                    createCollectionForm.setValue('color', val)
                  }
                  type="single"
                  disabled={isPending}
                  className="w-full grid grid-cols-4 gap-3"
                >
                  {COLOR_OPTIONS?.map((color) => (
                    <ToggleGroupItem
                      key={color.name}
                      title={color.name}
                      className={cn(
                        `h-12 w-full rounded-lg ${color.class} hover:${color.class} hover:scale-105 transition-transform border-2 border-transparent hover:border-primary`,
                      )}
                      value={color.code}
                      aria-label={`Toggle ${color.name}`}
                    />
                  ))}
                </ToggleGroup>
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <FormField
              control={createCollectionForm.control}
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
              onChange={(e) => setInputValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter to add tags
            </p>
          </div>

          <div className="space-y-2">
            <Label>Selected Tags</Label>
            <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border border-border rounded-md bg-input">
              {createCollectionForm.watch('tags')?.map((tag) => (
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

          {!!popularTags.length && (
            <div className="space-y-2">
              <Label>Popular Tags</Label>
              <div className="flex flex-wrap gap-1">
                {popularTags?.map((tag) => (
                  <Badge
                    key={tag.name}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-primary/10"
                    onClick={() => handleSelectingTags(tag.name)}
                  >
                    {tag.name}
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
            control={createCollectionForm.control}
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
