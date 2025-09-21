import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './features/auth/components/auth-provider'
import { router } from './main'
import { ThemeProvider } from './components/providers/theme-provider'
import {
  queryClient,
  TanstackQueryProvider,
} from './components/providers/tanstack-query-provider'
import React from 'react'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { DeleteConfirmationProvider } from './components/providers/delete-confirmation-provider'
import { Toaster } from 'sonner'

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
    </React.Fragment>
  )
}
