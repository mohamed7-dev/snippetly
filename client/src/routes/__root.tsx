import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import {
  queryClient,
  TanstackQueryProvider,
} from '@/components/providers/tanstack-query-provider'
import { Toaster } from 'sonner'
import type { QueryClient } from '@tanstack/react-query'
import { DeleteConfirmationProvider } from '@/components/providers/delete-confirmation-provider'
import { type AuthContextValue } from '@/features/auth/components/auth-provider'
import {
  NotFoundPageView,
  type NotFoundMetaData,
} from '@/components/views/not-found-page-view'
import { ErrorPageView } from '@/components/views/error-page-view'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  authContext?: AuthContextValue
}>()({
  component: () => (
    <div className="min-h-screen bg-background">
      <TanstackQueryProvider>
        <DeleteConfirmationProvider>
          <Outlet />
        </DeleteConfirmationProvider>
        <Toaster position="top-center" />
      </TanstackQueryProvider>
      <TanstackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: 'Tanstack Query',
            render: <ReactQueryDevtoolsPanel client={queryClient} />,
          },
        ]}
      />
    </div>
  ),
  notFoundComponent: (meta) => {
    return (
      <NotFoundPageView
        title={(meta.data as NotFoundMetaData).title}
        description={(meta.data as NotFoundMetaData).description}
      />
    )
  },
  errorComponent: (e) => {
    console.log('error from 2', e)
    return <ErrorPageView error={e.error} reset={e.reset} />
  },
})
