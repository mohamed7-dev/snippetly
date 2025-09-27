import { ProcessStatus } from '@/components/feedback/process-status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { registerLanguage } from '@/lib/highlightjs'
import { removeSavedSnippet } from '@/lib/offline-store'
import { useLoaderData, useNavigate, useRouter } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import React from 'react'

export function SnippetSection() {
  const meta = useLoaderData({ from: '/(public)/offline/$id' })
  const router = useRouter()
  const navigate = useNavigate()
  const handleRemove = () => {
    removeSavedSnippet(meta.data?.publicId ?? '')
    navigate({ to: '/offline' })
    router.invalidate()
  }
  if (meta.status === 'missing') {
    return (
      <ProcessStatus
        variant={'destructive'}
        title="Not saved for offline"
        description={"This snippet isn't in your offline library."}
      />
    )
  }
  if (meta.status === 'ready' && !!('data' in meta)) {
    const codeElRef = React.useRef<HTMLElement | null>(null)
    const code = meta.data?.code ?? ''
    const lang = (meta.data?.language ?? 'plaintext').toLowerCase()

    React.useEffect(() => {
      let cancelled = false
      ;(async () => {
        try {
          const hljs = (await import('highlight.js/lib/core')).default
          await registerLanguage(hljs, lang)
          if (!cancelled && codeElRef.current) {
            hljs.highlightElement(codeElRef.current)
          }
        } catch (e) {
          if (!cancelled && codeElRef.current) {
            codeElRef.current.textContent = code
          }
        }
      })()
      return () => {
        cancelled = true
      }
    }, [code, lang])

    return (
      <article className="space-y-3">
        <h1 className="text-2xl font-semibold">{meta.data?.title}</h1>
        {meta.data?.description ? (
          <p className="opacity-80">{meta.data?.description}</p>
        ) : null}
        {meta.data ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm opacity-70">
                  saved on{' '}
                  {new Date(
                    meta.data?.savedAt ?? Date.now(),
                  ).toLocaleDateString()}
                </p>
                <Badge variant="outline" className="text-xs">
                  {meta.data?.language}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleRemove}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
            <pre className="bg-muted/50 p-3 rounded-md overflow-auto text-sm">
              <code ref={codeElRef} className={`language-${lang}`}>
                {code}
              </code>
            </pre>

            {meta.data?.note ? (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold">Snippet Note</h2>
                <p className="bg-muted/50 p-3 rounded-md overflow-auto text-sm">
                  {meta.data?.note}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm opacity-70">
            No cached data. Content may be limited offline.
          </p>
        )}
      </article>
    )
  }
  return null
}
