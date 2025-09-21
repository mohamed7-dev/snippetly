import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SearchIcon } from 'lucide-react'
import React from 'react'

type SearchFormProps = React.ComponentProps<'form'>
export function SearchForm({ className, ...props }: SearchFormProps) {
  return (
    <form className={cn('relative w-64', className)} {...props}>
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search friends..."
        className="pl-10 bg-muted/50 border-border"
      />
    </form>
  )
}
