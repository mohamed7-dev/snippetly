import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { XIcon } from 'lucide-react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { EditSnippetSchema } from '../../lib/schema'
import React from 'react'
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import { useEnterTag } from '@/hooks/use-enter-tag'
import { getCurrentUserCollectionsOptions } from '@/features/collections/lib/api'
import { getSnippetQueryOptions } from '../../lib/api'
import { useParams } from '@tanstack/react-router'
import { useGetUpdateSnippetMutationState } from '../../hooks/use-update-snippet'

export function Sidebar() {
  const editSnippetForm: UseFormReturn<EditSnippetSchema> = useFormContext()
  const addTags = editSnippetForm.getValues('addTags')
  const removeTags = editSnippetForm.getValues('removeTags')

  // popular tags
  const {
    data: { data: popularTags },
  } = useSuspenseQuery(getPopularTagsOptions)

  // initial collection/tags
  const { slug } = useParams({
    from: '/(protected)/dashboard/snippets/$slug/edit',
  })
  const {
    data: { data: initialSnippet },
  } = useSuspenseQuery(getSnippetQueryOptions(slug))
  const initialCollection = initialSnippet.collection
  const initialTags = initialSnippet.tags.map((tag) => tag.name)
  const allTags = [...initialTags, ...(addTags ?? [])]

  // entering tags
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = React.useState('')
  const handleTagChange = (tag: string) => {
    editSnippetForm.setValue('addTags', [...(addTags ?? []), tag])
    setInputValue('')
  }
  useEnterTag({
    tags: allTags,
    inputElem: inputRef,
    onValueChange: handleTagChange,
  })

  // user collections
  const { data: collectionsData } = useSuspenseInfiniteQuery(
    getCurrentUserCollectionsOptions,
  )
  const collections = collectionsData.pages?.flatMap((p) => p.items) ?? []
  const filteredCollections = collections.filter(
    (c) => c.publicId !== initialCollection.publicId,
  )

  // select/deselect tags
  const handleSelectingTags = (tag: string) => {
    const foundTag = allTags?.find((t) => t === tag)
    if (foundTag) return undefined
    editSnippetForm.setValue('addTags', [...(addTags ?? []), tag])
  }

  const handleDeselectingTags = (tag: string) => {
    // if the tag exists in add tags array, remove it
    const foundTagInAddTag = addTags?.find((t) => t === tag)
    if (foundTagInAddTag) {
      editSnippetForm.setValue(
        'addTags',
        addTags?.filter((t) => t !== tag),
      )
      return
    }
    // if the tag exists in the original tags array, then add it to the remove tags array
    const foundTagInInitial = initialTags?.find((t) => t === tag)
    if (foundTagInInitial) {
      editSnippetForm.setValue('removeTags', [...(removeTags ?? []), tag])
    }
  }
  // mutation state
  const [state] = useGetUpdateSnippetMutationState()
  const isPending = state?.status === 'pending'
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
              {allTags?.map((tag) => (
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
          <CardTitle className="font-heading text-base">Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={editSnippetForm.control}
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Add to collection" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={initialCollection.publicId} disabled>
                      {initialCollection.title}
                      <Badge variant={'outline'}>selected</Badge>
                    </SelectItem>
                    {filteredCollections.map((collection) => (
                      <SelectItem
                        key={collection.publicId}
                        value={collection.publicId}
                      >
                        {collection.title}
                      </SelectItem>
                    ))}
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
            control={editSnippetForm.control}
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
