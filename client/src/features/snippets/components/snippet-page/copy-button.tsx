import { Button } from '@/components/ui/button'
import { CopyCheckIcon, CopyIcon } from 'lucide-react'
import { useCopyCode } from '../../hooks/use-copy-code'
import { useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getSnippetQueryOptions } from '../../lib/api'

export function CopyButton() {
  const params = useParams({ from: '/(protected)/dashboard/snippets/$slug/' })

  const { data } = useSuspenseQuery(getSnippetQueryOptions(params.slug))
  const snippet = data.data
  const { copyCode, isCopied } = useCopyCode({ code: snippet.code })

  return (
    <Button variant="outline" size="sm" onClick={copyCode}>
      {isCopied ? <CopyCheckIcon /> : <CopyIcon className="h-4 w-4 mr-2" />}
      {isCopied ? 'Copied' : 'Copy Code'}
    </Button>
  )
}
