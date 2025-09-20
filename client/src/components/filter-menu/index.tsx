import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import React from 'react'
import z from 'zod'

type UseFilterProps<Data extends Array<object>> = {
  filter: z.infer<typeof searchFilterSchema>['filter']
  data: Data
}
export function useFilter<Data extends Array<{ addedAt: string }>>({
  data,
  filter,
}: UseFilterProps<Data>) {
  return React.useMemo(() => {
    if (filter === 'recent') {
      return data.sort(
        (snippet, nextSnippet) =>
          new Date(nextSnippet.addedAt).getTime() -
          new Date(snippet.addedAt).getTime(),
      )
    } else if (filter === 'old') {
      return data.sort(
        (snippet, nextSnippet) =>
          new Date(snippet.addedAt).getTime() -
          new Date(nextSnippet.addedAt).getTime(),
      )
    } else {
      return data
    }
  }, [data, filter])
}

export const searchFilterSchema = z.object({
  filter: z.enum(['recent', 'old']).default('recent'),
})

type FilterMenuProps = {
  onSelect: (filter: 'recent' | 'old') => void
  selected: 'recent' | 'old'
}
export function FilterMenu({ onSelect, selected }: FilterMenuProps) {
  const [open, setOpen] = React.useState(false)
  const handleSelect = (select: FilterMenuProps['selected']) => {
    onSelect(select)
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Sort by: <span className="capitalize">{selected}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col max-w-36">
        <Button
          variant={'ghost'}
          size="sm"
          className="justify-start"
          onClick={() => handleSelect('recent')}
        >
          Recent
        </Button>
        <Button
          variant={'ghost'}
          size="sm"
          className="justify-start"
          onClick={() => handleSelect('old')}
        >
          Old
        </Button>
      </PopoverContent>
    </Popover>
  )
}
