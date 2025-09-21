import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SearchIcon } from 'lucide-react'

type SearchFormProps = React.ComponentProps<'form'>
export function SearchForm({ className, ...props }: SearchFormProps) {
  return (
    <form {...props} className={cn('relative w-64', className)}>
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search snippets..."
        className="pl-10 bg-muted/50 border-border"
      />
    </form>
  )
}
