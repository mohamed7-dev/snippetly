import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { XIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { UpdateCollectionSchema } from '../../lib/schema'
import { getPopularTagsOptions } from '@/features/tags/lib/api'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { getCollectionQueryOptions } from '../../lib/api'
import { useEnterTag } from '@/hooks/use-enter-tag'
import { useGetUpdateCollectionMutationState } from '../../hooks/use-update-collection'

export function TagsField() {
  // form
  const updateCollectionForm: UseFormReturn<UpdateCollectionSchema> =
    useFormContext()
  const addTags = updateCollectionForm.watch('addTags')
  const removeTags = updateCollectionForm.watch('removeTags')

  // initial collection/tags
  const { slug } = useParams({
    from: '/(protected)/dashboard/collections/$slug/edit',
  })
  const {
    data: { data: initialCollection },
  } = useSuspenseQuery(getCollectionQueryOptions(slug))
  const initialTags = initialCollection.tags.map((tag) => tag.name)
  const allTags = [...initialTags, ...(addTags ?? [])]

  // entering tags
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = React.useState('')
  const handleTagChange = (tag: string) => {
    updateCollectionForm.setValue('addTags', [...(addTags ?? []), tag])
    setInputValue('')
  }
  useEnterTag({
    tags: allTags,
    inputElem: inputRef,
    onValueChange: handleTagChange,
  })

  // select/deselect tags
  const handleSelectingTags = (tag: string) => {
    const foundTag = allTags?.find((t) => t === tag)
    if (foundTag) return undefined
    updateCollectionForm.setValue('addTags', [...(addTags ?? []), tag])
  }

  const handleDeselectingTags = (tag: string) => {
    // if the tag exists in add tags array, remove it
    const foundTagInAddTag = addTags?.find((t) => t === tag)
    if (foundTagInAddTag) {
      updateCollectionForm.setValue(
        'addTags',
        addTags?.filter((t) => t !== tag),
      )
      return
    }
    // if the tag exists in the original tags array, then add it to the remove tags array
    const foundTagInInitial = initialTags?.find((t) => t === tag)
    if (foundTagInInitial) {
      updateCollectionForm.setValue('removeTags', [...(removeTags ?? []), tag])
    }
  }

  // Popular tags
  const { data } = useSuspenseQuery(getPopularTagsOptions)
  const popularTags = React.useMemo(() => {
    return data.data.filter((t) => !allTags.includes(t.name))
  }, [allTags])

  // state
  const mutationState = useGetUpdateCollectionMutationState()
  const isPending = mutationState?.[0]?.status === 'pending'
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
  )
}
