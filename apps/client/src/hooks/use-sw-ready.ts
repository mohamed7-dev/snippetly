import React from 'react'

/**
 * @description
 * Returns true only when:
 * - Service workers are supported AND
 * - We have an active/ready registration (installed + controlling the page)
 */
export function useServiceWorkerReady() {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !window.isSecureContext // SWs require https or localhost
    ) {
      setReady(false)
      return
    }

    let cancelled = false

    // If the page is already controlled by a SW, we can show the button
    if (navigator.serviceWorker.controller) {
      setReady(true)
    }

    // Wait for the active/ready registration
    navigator.serviceWorker.ready
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(false)
      })

    // If a new SW takes control later, reflect that
    const onControllerChange = () => setReady(true)
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      onControllerChange,
    )

    return () => {
      cancelled = true
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange,
      )
    }
  }, [])

  return ready
}
