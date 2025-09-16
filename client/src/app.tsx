import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './features/auth/components/auth-provider'
import { router } from './main'

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ authContext: auth }} />
}
export function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}
