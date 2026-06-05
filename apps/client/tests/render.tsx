import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { DeleteConfirmationProvider } from '@/components/providers/delete-confirmation-provider'
import { useAuth } from '@/features/auth/components/auth-provider'
import { routeTree } from '@/routeTree.gen'
import { Toaster } from 'sonner'

type RenderOptions = {
  initialUrl?: string
}

export function renderWithProviders({ initialUrl = '/' }: RenderOptions = {}) {
  const auth = useAuth()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // VERY important for tests
      },
    },
  })

  const history = createMemoryHistory({
    initialEntries: [initialUrl],
  })

  const router = createRouter({
    routeTree,
    history,
    context: {
      queryClient,
      authContext: undefined,
    },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <DeleteConfirmationProvider>
        <RouterProvider router={router} context={{ authContext: auth }} />
        <Toaster position="top-center" />
      </DeleteConfirmationProvider>
    </QueryClientProvider>,
  )
}
