import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CopyIcon,
  EditIcon,
  MoreHorizontalIcon,
  StarIcon,
  Trash2Icon,
} from 'lucide-react'
import type { Snippet } from '../lib/types'

type DashboardSnippetCardProps = {
  snippet: Snippet
}

export function DashboardSnippetCard({ snippet }: DashboardSnippetCardProps) {
  return (
    <Card
      key={snippet.id}
      className="border-border hover:shadow-lg transition-shadow"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-heading">
              {snippet.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {snippet.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <CopyIcon className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem>
                <EditIcon className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <StarIcon className="mr-2 h-4 w-4" />
                Star
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {snippet.code}
          </Badge>
          {snippet.isPrivate && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {snippet.createdAt}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-muted rounded-lg p-3 font-mono text-sm overflow-hidden">
          <pre className="text-foreground whitespace-pre-wrap line-clamp-6">
            {snippet.code}
          </pre>
        </div>
        <div className="flex items-center gap-1 mt-3">
          {snippet.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
