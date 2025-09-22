import { GoodbyePageView } from '@/components/views/goodbye-page-view'
import { createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'

const searchSchema = z.object({
  ['redirected-from-delete']: z.boolean().catch(false),
})
export const Route = createFileRoute('/(public)/goodbye')({
  component: GoodbyePage,
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    if (!search['redirected-from-delete']) {
      throw redirect({
        to: '/',
      })
    }
  },
})

function GoodbyePage() {
  const search = Route.useSearch()

  if (!search['redirected-from-delete']) {
    throw redirect({
      to: '/',
    })
  }
  return <GoodbyePageView />
}
