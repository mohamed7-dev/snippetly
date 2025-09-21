import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { getUserSnippetsOptions } from '@/features/snippets/lib/api'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

export function SnippetsTabContent() {
  const { name } = useParams({ from: '/(public)/profile/$name' })
  const { data } = useSuspenseInfiniteQuery(getUserSnippetsOptions(name))
  const snippets = data.pages?.flatMap((p) => p.items) ?? []
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.publicId}
          snippet={{ ...snippet, isPrivate: snippet?.isPrivate ?? false }}
        />
      ))}
    </div>
  )
}
