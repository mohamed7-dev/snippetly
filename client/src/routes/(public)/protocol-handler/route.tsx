import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/(public)/protocol-handler')({
  component: ProtocolHandlerPage,
  validateSearch: z.object({
    q: z.string().optional(),
  }),
})

function ProtocolHandlerPage() {
  const { q } = Route.useSearch()
  const navigate = Route.useNavigate()
  console.log(q)
  // q example: "web+snippetly://snippets?slug=react-patterns"
  if (typeof q === 'string') {
    try {
      // Extract the part after "web+snippetly://"
      const raw = q.replace(/^web\+snippetly:\//, '')
      const [kind, queryString] = raw.split('?')
      const params = new URLSearchParams(queryString || '')

      switch (kind) {
        case 'snippets': {
          const slug = params.get('slug')
          if (slug)
            navigate({ to: '/dashboard/snippets/$slug', params: { slug } })
          else navigate({ to: '/dashboard' })
          break
        }
        case 'collections': {
          const slug = params.get('slug')
          if (slug)
            navigate({ to: '/dashboard/collections/$slug', params: { slug } })
          else navigate({ to: '/dashboard/collections' })
          break
        }
        case 'users': {
          const name = params.get('name')
          if (name) navigate({ to: '/profile/$name', params: { name } })
          else navigate({ to: '/dashboard/discover' })
          break
        }
        default:
          // Fallback to home
          navigate({ to: '/' })
      }
    } catch {
      navigate({ to: '/' })
    }
  } else {
    navigate({ to: '/' })
  }

  return null
}
