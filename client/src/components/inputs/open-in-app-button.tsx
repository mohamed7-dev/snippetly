import { APP_NAME } from '@/config/app'
import { useServiceWorkerReady } from '@/hooks/use-sw-ready'

type OpenInAppButtonProps = {
  slug: string
  endpoint: 'snippets' | 'collections' | 'users'
}

export function OpenInAppButton({ slug, endpoint }: OpenInAppButtonProps) {
  const swReady = useServiceWorkerReady()

  if (!swReady) return null

  const protocolHref = `web+snippetly:${endpoint}/${encodeURIComponent(slug)}`
  const fallbackHref = `/`

  return (
    <a
      href={protocolHref}
      onClick={() => {
        // Optional graceful fallback if protocol handler is not yet bound:
        const fallbackTimeout = setTimeout(() => {
          if (!document.hidden) window.location.href = fallbackHref
        }, 500)
        // If navigation succeeds (app takes focus), the page will become hidden.
        // If not, we’ll hit the timeout and follow fallback.
        // Cleanup if the user navigates away quickly
        window.addEventListener(
          'pagehide',
          () => clearTimeout(fallbackTimeout),
          { once: true },
        )
      }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-accent"
      title={`Open in ${APP_NAME}`}
    >
      Open in {APP_NAME}
    </a>
  )
}
