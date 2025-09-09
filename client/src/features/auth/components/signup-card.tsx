import { AuthCard } from './auth-card'
import { Input } from '@/components/ui/input'
import { CheckIcon } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { signupSchema, type SignupSchema } from '../lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { STRONG_PASSWORD_REQUIREMENTS } from '@/lib/zod'
import { LoadingButton } from '@/components/inputs/loading-button'
import { clientRoutes } from '@/lib/routes'
import { useSignup } from '../hooks/use-signup'
import { ProcessStatus } from '@/components/feedback/process-status'
import { toast } from 'sonner'
import { useAuth } from './auth-provider'

function SuggestedNames({ names }: { names: string[] }) {
  return (
    <div className="space-y-2">
      <p>Account with the same name already exists.</p>
      <p className="text-base font-medium">Suggested Names: </p>
      <ul className="flex items-center flex-wrap gap-2">
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}

export function SignupCard() {
  const { login: authenticateUserOnClient } = useAuth()
  const navigate = useNavigate()
  const signupForm = useForm<SignupSchema>({
    defaultValues: {
      name: '',
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      acceptedPolicies: false,
    },
    resolver: zodResolver(signupSchema),
  })
  const {
    mutateAsync: signup,
    isPending,
    error,
  } = useSignup({
    onSuccess: (data) => {
      console.log('Success Signup', data)
      toast.success(data.message)
      if ('accessToken' in data.data) {
        const accessToken = data.data.accessToken
        const user = data.data.user
        authenticateUserOnClient(accessToken, {
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          id: user.id,
        })
        navigate({ to: clientRoutes.dashboard, from: clientRoutes.login })
      }
    },
    onError: (error) => {
      console.log('Error Signup', error)
    },
  })

  const onSubmit = async (values: SignupSchema) => {
    const { passwordConfirm, ...rest } = values
    await signup(rest)
  }
  return (
    <AuthCard
      cardTitle="Create your account"
      cardDescription="Join thousands of developers organizing their code"
    >
      {!!error && (
        <ProcessStatus
          title={error.response?.statusText ?? error.name}
          description={
            error.status === 409 ? (
              <SuggestedNames names={error.response?.data?.data ?? []} />
            ) : (
              (error.response?.data.message ?? error.message)
            )
          }
          className="mb-4"
        />
      )}
      <Form {...signupForm}>
        <form
          className="space-y-4"
          onSubmit={signupForm.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={signupForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="john" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signupForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={signupForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    inputMode="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signupForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input placeholder="john-doe2025" {...field} />
                </FormControl>
                <FormDescription>
                  This will be your public profile name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signupForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={'*'.repeat(12)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signupForm.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password Confirmation</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={'*'.repeat(12)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password requirements */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Password requirements:</p>
            <div className="space-y-1">
              {STRONG_PASSWORD_REQUIREMENTS.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs">
                  <CheckIcon className="size-3 text-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <FormField
              control={signupForm.control}
              name="acceptedPolicies"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        signupForm.setValue(
                          'acceptedPolicies',
                          checked as boolean,
                        )
                      }}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">
                    I agree to the{' '}
                    <Link to="." className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="." className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <LoadingButton isLoading={isPending} type="submit" className="w-full">
            Create Account
          </LoadingButton>
        </form>
      </Form>
      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          to={clientRoutes.login}
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  )
}
