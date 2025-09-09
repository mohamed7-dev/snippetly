import { clientRoutes } from '@/lib/routes'
import { Link } from '@tanstack/react-router'
import { Code2Icon } from 'lucide-react'

export function Logo() {
  return (
    <Link to={clientRoutes.landing} className="flex items-center gap-2">
      <Code2Icon className="size-6 text-primary" />
      <span className="font-heading font-bold text-lg">CodeVault</span>
    </Link>
  )
}
