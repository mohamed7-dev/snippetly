import React from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './features/auth/components/auth-provider'
import { router } from './main'
import { ThemeProvider } from './components/providers/theme-provider'
import {
  queryClient,
  TanstackQueryProvider,
} from './components/providers/tanstack-query-provider'
import { DeleteConfirmationProvider } from './components/providers/delete-confirmation-provider'
import { Toaster } from 'sonner'

// Development: Lazy load DevTools components
const LazyDevTools = React.lazy(async () => {
  if (import.meta.env.DEV) {
    const [
      { TanstackDevtools },
      { TanStackRouterDevtoolsPanel },
      { ReactQueryDevtoolsPanel },
    ] = await Promise.all([
      import('@tanstack/react-devtools'),
      import('@tanstack/react-router-devtools'),
      import('@tanstack/react-query-devtools'),
    ])

    return {
      default: () => (
        <TanstackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel router={router} />,
            },
            {
              name: 'Tanstack Query',
              render: <ReactQueryDevtoolsPanel client={queryClient} />,
            },
          ]}
        />
      ),
    }
  }

  // Production: Return empty component
  return { default: () => <></> }
})

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ authContext: auth }} />
}
export function App() {
  return (
    <React.Fragment>
      <AuthProvider>
        <TanstackQueryProvider>
          <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
            <DeleteConfirmationProvider>
              <InnerApp />
              <Toaster position="top-center" />
            </DeleteConfirmationProvider>
          </ThemeProvider>
        </TanstackQueryProvider>
      </AuthProvider>

      <React.Suspense fallback={null}>
        <LazyDevTools />
      </React.Suspense>
    </React.Fragment>
  )
}
