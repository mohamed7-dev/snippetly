import { InfiniteLoader } from '@/components/loaders/infinite-loader'
import { Button } from '@/components/ui/button'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { getSnippetsByCollectionOptions } from '@/features/snippets/lib/api'
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Code2Icon, PlusIcon } from 'lucide-react'
import { FilterMenu, useFilter } from '../../../../components/filter-menu'

export function SnippetsGridSection() {
  // router
  const params = useParams({
    from: '/(protected)/dashboard/collections/$slug/',
  })
  const navigate = useNavigate({ from: '/dashboard/collections/$slug' })

  // filter
  const { filter } = useSearch({
    from: '/(protected)/dashboard/collections/$slug/',
  })

  // snippets
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(getSnippetsByCollectionOptions(params.slug))
  const snippets = data.pages?.flatMap((p) => p.items.snippets) ?? []
  const total = data.pages?.[0].total

  const filteredSnippets = useFilter({ data: snippets, filter })

  const qClient = useQueryClient()
  const onSnippetMutationSuccess = () => {
    qClient.invalidateQueries({
      queryKey: ['snippets', 'collection', params.slug],
    })
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-xl">
          Snippets ({total})
        </h2>
        <div className="flex items-center gap-2">
          <FilterMenu
            onSelect={(selected) => navigate({ search: { filter: selected } })}
            selected={filter}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSnippets.map((snippet) => (
          <SnippetCard
            key={snippet.publicId}
            snippet={{ ...snippet }}
            deleteSnippet={{
              onSuccess: onSnippetMutationSuccess,
            }}
            forkSnippet={{
              onSuccess: onSnippetMutationSuccess,
            }}
          />
        ))}
      </div>
      <InfiniteLoader
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        Content={
          !filteredSnippets?.length ? (
            <div className="text-center py-12">
              <Code2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                No snippets in this collection
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first snippet to get started
              </p>
              <Button asChild>
                <Link to="/dashboard/snippets/new">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Snippet
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
    </div>
  )
}
