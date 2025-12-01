import { Link, useLoaderData } from '@tanstack/react-router'

export function SnippetsList() {
  const data = useLoaderData({ from: '/(public)/offline/' })
  if (!data.length) {
    return (
      <p className="text-sm opacity-80">
        You haven't saved any snippets for offline use yet.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {data.map((it) => (
        <li
          key={it.publicId}
          className="border rounded-md p-3 flex items-center justify-between"
        >
          <div>
            <div className="font-medium">{it.title}</div>
            {it.description ? (
              <div className="text-sm opacity-80 line-clamp-2">
                {it.description}
              </div>
            ) : null}
          </div>
          <Link
            to="/offline/$id"
            params={{ id: it.publicId }}
            className="text-primary hover:underline"
          >
            View
          </Link>
        </li>
      ))}
    </ul>
  )
}
