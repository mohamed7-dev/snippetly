/// <reference lib="webworker" />

// Constants <updated when files in main thread get changed>
const CACHE_VERSION = 'v1'
const PRECACHE = `precache-${CACHE_VERSION}`

// Use a typed alias to the global scope without redeclaring `self`
const sw = self as unknown as ServiceWorkerGlobalScope

// Placeholder for build-time injected precache manifest. The Vite plugin replaces
// the string '__PRECACHE_MANIFEST__' with a JSON string (e.g., "[\"/assets/app.js\"]"),
// which we parse here to get the list of URLs.
const PRECACHE_FROM_BUILD: string[] = JSON.parse('__PRECACHE_MANIFEST__')

sw.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Installing SW...')
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE)
      // Pre-cache only the build-injected list
      if (Array.isArray(PRECACHE_FROM_BUILD) && PRECACHE_FROM_BUILD.length) {
        try {
          await cache.addAll(PRECACHE_FROM_BUILD)
        } catch (e) {
          console.warn('[SW] Precaching injected manifest partially failed:', e)
        }
      }
    })(),
  )
})

sw.addEventListener('activate', (event: ExtendableEvent) => {
  // cleanup older cache stores (keep only PRECACHE)
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== PRECACHE).map((k) => caches.delete(k)),
        ),
      ),
  )
  sw.clients.claim()
})

sw.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event

  // Handle SPA navigation requests: network-first with app shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request)
          return network
        } catch (err) {
          const cache = await caches.open(PRECACHE)
          const cached = await cache.match(request.url)
          if (cached) return cached
          // Prefer serving the app shell so cached assets can still load
          const appShell = await cache.match('/index.html')
          if (appShell) return appShell
          return Response.error()
        }
      })(),
    )
    return
  }

  // Static assets: use cache-first from PRECACHE
  const url = new URL(request.url)
  const isAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/manifest.webmanifest' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'manifest'

  if (request.method === 'GET' && isAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PRECACHE)
        const cached = await cache.match(request.url)
        if (cached) return cached
        try {
          // Not in precache (e.g., on a new deploy before new SW activates)
          return await fetch(request)
        } catch {
          // Offline and not precached
          return Response.error()
        }
      })(),
    )
    return
  }

  // For non-navigation requests: network-only (no runtime caching)
  event.respondWith(
    (async () => {
      try {
        return await fetch(request)
      } catch (err) {
        // As a last resort, return an error. We don't cache non-asset requests.
        return Response.error()
      }
    })(),
  )
})
