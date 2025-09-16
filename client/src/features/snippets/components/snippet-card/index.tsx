import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Trash2Icon, MoreHorizontalIcon, EditIcon, EyeIcon } from 'lucide-react'
import type { Snippet } from '../../lib/types'
import type { Tag } from '@/features/tags/lib/types'
import { CopyButton } from '../copy-button'
import { Link } from '@tanstack/react-router'
import { useDeleteConfirmation } from '@/components/providers/delete-confirmation-provider'
import { useDeleteSnippet } from '../../hooks/use-delete-snippet'

type SnippetItem = Pick<
  Snippet,
  | 'id'
  | 'title'
  | 'slug'
  | 'code'
  | 'language'
  | 'isPrivate'
  | 'createdAt'
  | 'description'
> & { tags: Pick<Tag, 'name'>[] }

type SnippetCardProps = {
  snippet: SnippetItem
  onCopy?: (code: string) => void
  onDelete?: (slug: string) => void
}

export function SnippetCard({ snippet, onCopy, onDelete }: SnippetCardProps) {
  const { confirm } = useDeleteConfirmation()
  const { mutateAsync: deleteSnippet, isPending: isDeleting } =
    useDeleteSnippet()
  const handleDelete = () => {
    confirm({
      title: 'Delete snippet',
      onConfirm: async () => await deleteSnippet({ slug: snippet.slug }),
    })
    onDelete?.(snippet.slug)
  }
  return (
    <Card className="border-border hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-heading group-hover:text-primary transition-colors">
              {snippet.title}
            </CardTitle>
            <CardDescription className="mt-1 text-pretty">
              {snippet.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <CopyButton
                  code={snippet.code}
                  variant={'ghost'}
                  className="w-full justify-start"
                  onClick={() => onCopy}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  variant={'ghost'}
                  size={'sm'}
                  className="w-full justify-start"
                  asChild
                >
                  <Link
                    to="/dashboard/snippets/$slug/edit"
                    params={{ slug: snippet.slug }}
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  variant={'ghost'}
                  size={'sm'}
                  className="w-full justify-start"
                  asChild
                >
                  <Link
                    to="/dashboard/snippets/$slug"
                    params={{ slug: snippet.slug }}
                  >
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs font-mono">
            {snippet.language}
          </Badge>
          {!snippet.isPrivate && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(snippet.createdAt)?.toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm overflow-hidden border">
          <pre className="text-foreground whitespace-pre-wrap line-clamp-6 text-xs leading-relaxed">
            {snippet.code}
          </pre>
        </div>
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          {'tags' in snippet
            ? snippet?.tags?.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="outline"
                  className="text-xs hover:bg-primary/10 cursor-pointer"
                >
                  #{tag.name}
                </Badge>
              ))
            : null}
        </div>
        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton code={snippet.code} onClick={() => onCopy} />
          <Button size="sm" variant="ghost" asChild>
            <Link
              to="/dashboard/snippets/$slug/edit"
              params={{ slug: snippet.slug }}
            >
              <EditIcon className="h-3 w-3 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
