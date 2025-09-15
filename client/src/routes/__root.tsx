import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import {
  queryClient,
  TanstackQueryProvider,
} from '@/components/providers/tanstack-query-provider'
import { AuthProvider } from '@/features/auth'
import { Toaster } from 'sonner'
import type { QueryClient } from '@tanstack/react-query'
import { DeleteConfirmationProvider } from '@/components/providers/delete-confirmation-provider'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <div className="min-h-screen bg-background">
      <TanstackQueryProvider>
        <AuthProvider>
          <DeleteConfirmationProvider>
            <Outlet />
          </DeleteConfirmationProvider>
          <Toaster position="top-center" />
        </AuthProvider>
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
})
