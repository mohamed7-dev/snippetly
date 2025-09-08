import { AuthCard } from './auth-card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CheckIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export function SignupCard() {
  return (
    <AuthCard
      cardTitle="Create your account"
      cardDescription="Join thousands of developers organizing their code"
    >
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="John"
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              className="bg-input border-border"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="johndoe"
            className="bg-input border-border"
          />
          <p className="text-xs text-muted-foreground">
            This will be your public profile name
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            className="bg-input border-border"
          />
        </div>

        {/* Password requirements */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Password requirements:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <CheckIcon className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                One uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">One number</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms" className="text-sm">
            I agree to the{' '}
            <Link to="." className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="." className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </AuthCard>
  )
}
