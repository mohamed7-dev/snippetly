import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { HeaderWrapper } from '../header-wrapper'
import { Logo } from '../logo'
import { useAuth } from '@/features/auth/components/auth-provider'

export function LandingHeader() {
  const { getCurrentUser } = useAuth()
  const user = getCurrentUser()
  return (
    <HeaderWrapper className="py-0">
      <div className="container mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
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
          {user ? (
            <Button className="items-center" variant="ghost" asChild>
              <Link to={'/dashboard'}>Go To Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to={'/login'}>Sign In</Link>
              </Button>
              <Button asChild>
                <Link to={'/signup'}>Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </HeaderWrapper>
  )
}
