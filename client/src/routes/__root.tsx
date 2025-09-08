import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import {
  queryClient,
  TanstackQueryProvider,
} from '@/components/providers/tanstack-query-provider'
import { AuthProvider } from '@/features/auth'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <TanstackQueryProvider>
        <AuthProvider>
          <Outlet />
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
