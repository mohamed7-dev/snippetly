import { ProcessStatus } from '@/components/feedback/process-status'
import { LoadingButton } from '@/components/inputs/loading-button'
import { PasswordField } from '@/components/inputs/password-field'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useLogin } from '../hooks/use-login'
import { loginSchema, type LoginSchema } from '../lib/schema'
import { AuthCard } from './auth-card'
import { useAuth } from './auth-provider'

export function LoginCard() {
  const { login: authenticateUserOnClient } = useAuth()
  const navigate = useNavigate()
  const { redirect: from } = useSearch({
    from: '/(auth)/(auth-layout)/_auth-layout/login',
  })

  const {
    mutateAsync: login,
    isPending,
    error,
  } = useLogin({
    onSuccess: (data) => {
      toast.success(data.message)
      const accessToken = data.data.accessToken
      authenticateUserOnClient(accessToken)
      if (!from) {
        navigate({
          to: '/dashboard',
          replace: true,
        })
      } else {
        navigate({
          href: from,
          replace: true,
        })
      }
    },
  })
  const onSubmit = async (values: LoginSchema) => {
    await login(values)
  }

  const loginForm = useForm({
    defaultValues: {
      name: '',
      password: '',
      rememberMe: false,
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <AuthCard
      cardTitle="Welcome back"
      cardDescription="Sign in to your account to access your code snippets"
    >
      <CardContent>
        {!!error && (
          <ProcessStatus
            title={error.response?.statusText ?? error.name}
            description={error.response?.data.message ?? error.message}
            className="mb-4"
          />
        )}
        <form
          id="login-form"
          className="space-y-4"
          autoComplete="off"
          onSubmit={async (e) => {
            e.preventDefault()
            await loginForm.handleSubmit()
          }}
        >
          <FieldGroup>
            <loginForm.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Name<sup className="text-sm">*</sup>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="john_doe"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      This will be your public profile name, spaces are not
                      allowed.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <loginForm.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Password<sup className="text-sm">*</sup>
                    </FieldLabel>
                    <PasswordField
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={'*'.repeat(12)}
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <div className="flex items-center justify-between">
              <loginForm.Field
                name="rememberMe"
                children={(field) => {
                  return (
                    <Field orientation="horizontal">
                      <Checkbox
                        id="remember-me-field"
                        checked={field.state.value}
                        onCheckedChange={(checked) =>
                          field.setValue(checked as boolean)
                        }
                      />
                      <FieldLabel
                        htmlFor="remember-me-field"
                        className="text-sm truncate overflow-x-auto"
                      >
                        Remember Me
                      </FieldLabel>
                    </Field>
                  )
                }}
              />
              <Button className="flex-1" variant={'link'} asChild>
                <Link to={'/forgot-password'} className="text-sm text-primary">
                  Forgot password?
                </Link>
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="self-start text-center text-sm mt-4">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link
            to={'/signup'}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
        <Field orientation={'horizontal'}>
          <LoadingButton
            isLoading={isPending}
            type="submit"
            form="login-form"
            className="w-full"
          >
            Sign In
          </LoadingButton>
        </Field>
      </CardFooter>
    </AuthCard>
  )
}
