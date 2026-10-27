import React from 'react'
import { Button } from '../ui/button'
import { useObserver } from '@/hooks/use-observer'

type InfiniteLoaderProps = {
  isManual?: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  Content?: React.ReactNode
}
export function InfiniteLoader(props: InfiniteLoaderProps) {
  const { isFetchingNextPage, isManual, hasNextPage, Content, fetchNextPage } =
    props

  const { targetRef, isIntersecting } = useObserver({
    threshold: 0.5,
    rootMargin: '100px',
  })

  React.useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, isManual, fetchNextPage])

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button
          variant="secondary"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </Button>
      ) : (
        <React.Fragment>
          {Content ? (
            Content
          ) : (
            <p className="text-xs text-muted-foreground">
              You have reached the end of the list
            </p>
          )}
        </React.Fragment>
      )}
    </div>
  )
}
