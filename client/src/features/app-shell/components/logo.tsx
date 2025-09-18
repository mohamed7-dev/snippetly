import { APP_NAME } from '@/config/app'
import { Link } from '@tanstack/react-router'
import { Code2Icon } from 'lucide-react'

export function Logo() {
  return (
    <Link to={'/'} className="flex items-center gap-2">
      <Code2Icon className="size-6 text-primary" />
      <span className="font-heading font-bold text-lg">{APP_NAME}</span>
    </Link>
  )
}
