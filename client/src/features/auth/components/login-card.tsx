import { AuthCard } from './auth-card'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginSchema } from '../lib/schema'
import { Checkbox } from '@/components/ui/checkbox'
import { clientRoutes } from '@/lib/routes'
import { useLogin } from '../hooks/use-login'
import { LoadingButton } from '@/components/inputs/loading-button'
import { toast } from 'sonner'
import { ProcessStatus } from '@/components/feedback/process-status'
import { useAuth } from './auth-provider'

export function LoginCard() {
  const { login: authenticateUserOnClient } = useAuth()
  const navigate = useNavigate()
  const loginForm = useForm<LoginSchema>({
    defaultValues: {
      name: '',
      password: '',
      rememberMe: false,
    },
    resolver: zodResolver(loginSchema),
  })

  const {
    mutateAsync: login,
    isPending,
    error,
  } = useLogin({
    onSuccess: (data) => {
      console.log('Success Login', data)
      toast.success(data.message)
      const user = data.data.user
      const accessToken = data.data.accessToken
      authenticateUserOnClient(accessToken, {
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
      })
      navigate({ to: clientRoutes.dashboard, from: clientRoutes.login })
    },
    onError: (error) => {
      console.log('Error Login', error)
    },
  })
  const onSubmit = async (values: LoginSchema) => {
    await login(values)
  }

  return (
    <AuthCard
      cardTitle="Welcome back"
      cardDescription="Sign in to your account to access your code snippets"
    >
      {!!error && (
        <ProcessStatus
          title={error.response?.statusText ?? error.name}
          description={error.response?.data.message ?? error.message}
          className="mb-4"
        />
      )}
      <Form {...loginForm}>
        <form
          className="space-y-4"
          autoComplete="off"
          onSubmit={loginForm.handleSubmit(onSubmit)}
        >
          <FormField
            name="name"
            control={loginForm.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input placeholder="user name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={loginForm.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              name="rememberMe"
              control={loginForm.control}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        loginForm.setValue('rememberMe', checked as boolean)
                      }
                    />
                  </FormControl>
                  <FormLabel>Remember Me</FormLabel>
                </FormItem>
              )}
            />

            <Link
              to={clientRoutes.forgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <LoadingButton isLoading={isPending} type="submit" className="w-full">
            Sign In
          </LoadingButton>
        </form>
      </Form>
      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link
          to={clientRoutes.signup}
          className="text-primary hover:underline font-medium"
        >
          Sign up
        </Link>
      </div>
    </AuthCard>
  )
}
