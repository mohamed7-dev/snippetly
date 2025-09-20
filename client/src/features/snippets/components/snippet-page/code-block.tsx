import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { getSnippetQueryOptions } from '../../lib/api'
import hljs from 'highlight.js'
import React from 'react'
import { CopyButton } from '../copy-button'

export function CodeBlock() {
  const params = useParams({ from: '/(protected)/dashboard/snippets/$slug/' })
  const { data } = useSuspenseQuery(getSnippetQueryOptions(params.slug))
  const snippet = data.data

  React.useLayoutEffect(() => {
    hljs.highlightAll()
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg">Code</CardTitle>
          <CopyButton code={snippet.code} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-muted/50 rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
            <span className="text-sm font-mono text-muted-foreground">
              {snippet.title.toLowerCase().replace(/\s+/g, '-')}.
              {snippet.language === 'javascript' ? 'js' : snippet.language}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive"></div>
              <div className="h-3 w-3 rounded-full bg-secondary"></div>
              <div className="h-3 w-3 rounded-full bg-primary"></div>
            </div>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="font-mono text-sm text-foreground tracking-normal leading-5 whitespace-pre-wrap">
              <code
                className={`language-${snippet.language} border border-gray-500 px-4 py-3 h-96 subpixel-antialiased`}
              >
                {snippet.code}{' '}
              </code>
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
