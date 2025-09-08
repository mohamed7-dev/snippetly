import { Label } from '@/components/ui/label'
import { AuthCard } from './auth-card'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function LoginCard() {
  return (
    <AuthCard
      cardTitle="Welcome back"
      cardDescription="Sign in to your account to access your code snippets"
    >
      <form className="space-y-4" autoComplete="off">
        <div className="space-y-2">
          <Label htmlFor="name">User Name</Label>
          <Input
            id="name"
            placeholder="Enter your user name"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="bg-input border-border"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <Label htmlFor="remember" className="text-sm">
              Remember me
            </Label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link to="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </div>
    </AuthCard>
  )
}
