import { useState } from 'react'
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
import {
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  Check,
  Share,
  Eye,
} from 'lucide-react'
import type { Snippet } from '../../lib/types'
import type { Tag } from '@/features/tags/lib/types'

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
  onEdit?: (slug: string) => void
  onDelete?: (slug: string) => void
}

export function SnippetCard({
  snippet,
  onCopy,
  onEdit,
  onDelete,
}: SnippetCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(snippet.code)
    } else {
      await navigator.clipboard.writeText(snippet.code)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy Code'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(snippet.slug)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete?.(snippet.slug)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
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
            {snippet.createdAt.toLocaleDateString()}
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
            ? snippet.tags.map((tag) => (
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
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <Copy className="h-3 w-3 mr-1" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit?.(snippet.slug)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
