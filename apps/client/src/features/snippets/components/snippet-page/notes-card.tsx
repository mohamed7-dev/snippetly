import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { getSnippetQueryOptions } from '../../lib/api'

export function NotesCard() {
  const params = useParams({ from: '/(protected)/dashboard/snippets/$slug/' })
  const { data } = useSuspenseQuery(getSnippetQueryOptions(params.slug))
  const snippet = data.data
  if (!snippet.note) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base">{snippet.note}</p>
      </CardContent>
    </Card>
  )
}
