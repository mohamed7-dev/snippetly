import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/config/app'
import { Link } from '@tanstack/react-router'
import { Code2Icon } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Code2Icon className="h-8 w-8 text-primary" />
            <span className="font-heading font-bold text-xl">{APP_NAME}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="."
              hash="features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              to="."
              hash="testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
