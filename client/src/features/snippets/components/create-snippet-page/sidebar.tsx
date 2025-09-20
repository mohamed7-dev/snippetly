import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import React from 'react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { CreateSnippetSchema } from '../../lib/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCurrentUserCollectionsOptions } from '@/features/collections/lib/api'
import { useGetCreateSnippetMutationState } from '../../hooks/use-create-snippet'
import { useEnterTag } from '@/hooks/use-enter-tag'
import { InfiniteLoader } from '@/components/loaders/infinite-loader'

export function Sidebar() {
  // form
  const createSnippetForm: UseFormReturn<CreateSnippetSchema> = useFormContext()
  const tags = createSnippetForm.watch('tags')

  // tags
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = React.useState('')

  const handleTagChange = (tag: string) => {
    createSnippetForm.setValue('tags', [...(tags ?? []), tag])
    setInputValue('')
  }
  useEnterTag({ tags, inputElem: inputRef, onValueChange: handleTagChange })
  const { data } = useSuspenseQuery(getPopularTagsOptions)
  const popularTags = data.data.filter((tag) => !tags?.includes(tag.name))

  const [mutationState] = useGetCreateSnippetMutationState()
  const isPending = mutationState?.status === 'pending'

  const {
    data: collectionsData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(getCurrentUserCollectionsOptions)
  const collections = collectionsData.pages?.flatMap((p) => p.items) ?? []

  const handleDeselectingTags = (tag: string) => {
    createSnippetForm.setValue(
      'tags',
      tags?.filter((t) => t !== tag),
    )
  }

  const handleSelectingTags = (tag: string) => {
    const foundTag = tags?.find((t) => t === tag)
    if (foundTag) return undefined
    createSnippetForm.setValue('tags', [...(tags ?? []), tag])
  }

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
              onChange={(e) => setInputValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter to add tags
            </p>
          </div>

          <div className="space-y-2">
            <Label>Selected Tags</Label>
            <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border border-border rounded-md bg-input">
              {tags?.map((tag) => (
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
          <CardTitle className="font-heading text-base">Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={createSnippetForm.control}
            name="collection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collection</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Add to collection" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem
                        key={collection.publicId}
                        value={collection.publicId}
                      >
                        {collection.title}
                      </SelectItem>
                    ))}
                    <InfiniteLoader
                      hasNextPage={hasNextPage}
                      fetchNextPage={fetchNextPage}
                      isFetchingNextPage={isFetchingNextPage}
                      Content={
                        <SelectItem value={'not-selectable'} disabled>
                          No more items
                        </SelectItem>
                      }
                    />
                  </SelectContent>
                </Select>
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
            control={createSnippetForm.control}
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
  )
}
