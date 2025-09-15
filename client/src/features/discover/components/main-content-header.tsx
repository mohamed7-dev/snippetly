import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'

export function MainContentHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Discover</h1>
        <p className="text-muted-foreground">
          Find amazing developers and their code snippets
        </p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1 md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search developers, tags, or snippets..."
            className="pl-10"
          />
        </div>
      </div>
    </div>
  )
}
