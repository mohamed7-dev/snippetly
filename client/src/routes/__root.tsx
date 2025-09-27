import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { type AuthContextValue } from '@/features/auth/components/auth-provider'
import {
  NotFoundPageView,
  type NotFoundMetaData,
} from '@/components/views/not-found-page-view'
import { ErrorPageView } from '@/components/views/error-page-view'
import { PageLoader } from '@/components/loaders/page-loader'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  authContext?: AuthContextValue
}>()({
  component: () => (
    <div className="min-h-screen bg-background">
      <HeadContent />
      <Outlet />
    </div>
  ),
  beforeLoad: async ({ context: { authContext } }) => {
    if (!authContext) return
    await authContext.ensureReady()
  },
  pendingComponent: () => {
    return <PageLoader containerProps={{ className: 'min-h-screen' }} />
  },
  notFoundComponent: (meta) => {
    return (
      <NotFoundPageView
        title={(meta.data as NotFoundMetaData).title}
        description={(meta.data as NotFoundMetaData).description}
      />
    )
  },
  errorComponent: (e) => {
    return <ErrorPageView error={e.error} reset={e.reset} />
  },
})
