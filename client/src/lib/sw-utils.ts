const ENABLE_SW = import.meta.env.PROD || import.meta.env.VITE_SW_DEV === '1'

/**
 * Register service worker for PWA
 */
export function registerSW() {
  if (!ENABLE_SW) return

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    if (ENABLE_SW) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { type: 'module' })
          .then((registration) => {
            console.log('SW registered with scope:', registration.scope)
          })
          .catch((err: unknown) => console.error('SW registration failed', err))
      })
    } else {
      // In dev, if disabled, make sure any existing SW is unregistered to avoid stale caching
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
      })
    }
  }

  // After SW is controlling the page, register the custom protocol handler once
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.ready
      .then(() => {
        if ('registerProtocolHandler' in navigator) {
          const key = 'snippetly:protocol-registered'
          if (!localStorage.getItem(key)) {
            try {
              navigator.registerProtocolHandler(
                'web+snippetly',
                `${location.origin}/protocol-handler?q=%s`,
              )
              localStorage.setItem(key, '1')
            } catch (e) {
              // Ignore if browser blocks or user declines
            }
          }
        }
      })
      .catch(() => {})
  }
}

/**
 * Get the active service worker controller
 */
export async function getController(): Promise<ServiceWorker | null> {
  if (navigator.serviceWorker.controller)
    return navigator.serviceWorker.controller
  await navigator.serviceWorker.ready
  // A reload might be necessary the very first time; try to grab controller again
  return navigator.serviceWorker.controller ?? null
}
