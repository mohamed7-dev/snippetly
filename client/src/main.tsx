import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createRouter } from '@tanstack/react-router'
import { queryClient } from './components/providers/tanstack-query-provider.tsx'
import { disableReactDevTools } from '@fvilers/disable-react-devtools'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { App } from './app.tsx'

// Create a new router instance
export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    // auth will initially be undefined
    // We'll be passing down the auth state from within a React component
    authContext: undefined,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// disable react dev tools
if (process.env.NODE_ENV === 'production') disableReactDevTools()

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
