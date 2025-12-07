import { ProcessStatus } from '@/components/feedback/process-status'
import { LoadingButton } from '@/components/inputs/loading-button'
import { PasswordField } from '@/components/inputs/password-field'
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
import { useSignup } from '../hooks/use-signup'
import { signupSchema, type SignupSchema } from '../lib/schema'
import { AuthCard } from './auth-card'
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
  const { redirect: from } = useSearch({
    from: '/(auth)/(auth-layout)/_auth-layout/signup',
  })

  const {
    mutateAsync: signup,
    isPending,
    error,
  } = useSignup({
    onSuccess: (data) => {
      toast.success(data.message)
      if ('accessToken' in data.data && data.data.accessToken) {
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
      }
    },
  })

  const onSubmit = async (values: SignupSchema) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm, ...rest } = values
    await signup(rest)
  }

  const signupForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      isPrivate: false,
      acceptedPolicies: false,
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })
  return (
    <AuthCard
      cardTitle="Create your account"
      cardDescription="Join thousands of developers organizing their code"
    >
      <CardContent>
        {!!error && (
          <ProcessStatus
            title={error.response?.statusText ?? error.name}
            description={
              error.response?.data.status === 409 ? (
                <SuggestedNames
                  names={error.response?.data?.data.suggestedNames ?? []}
                />
              ) : (
                (error.response?.data.message ?? error.message)
              )
            }
            className="mb-4"
          />
        )}
        <form
          id="signup-form"
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            signupForm.handleSubmit()
          }}
        >
          <FieldGroup>
            <signupForm.Field
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
            <signupForm.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Email<sup className="text-sm">*</sup>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      inputMode="email"
                      type="email"
                      placeholder="test@example.com"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <signupForm.Field
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
            <signupForm.Field
              name="passwordConfirm"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Password Confirm<sup className="text-sm">*</sup>
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
          </FieldGroup>

          <FieldGroup>
            <signupForm.Field
              name="acceptedPolicies"
              children={(field) => {
                return (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="accepted-policies-field"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.setValue(checked as boolean)
                      }
                    />
                    <FieldLabel
                      htmlFor="accepted-policies-field"
                      className="text-sm truncate overflow-x-auto"
                    >
                      I agree to the{' '}
                      <Link to="." className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="." className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </FieldLabel>
                  </Field>
                )
              }}
            />
            <signupForm.Field
              name="isPrivate"
              children={(field) => {
                return (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="is-private-field"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.setValue(checked as boolean)
                      }
                    />
                    <FieldLabel
                      htmlFor="is-private-field"
                      className="text-sm truncate overflow-x-auto"
                    >
                      Make account private?
                    </FieldLabel>
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="self-start text-sm mt-4">
          <span className="text-muted-foreground">
            Already have an account?{' '}
          </span>
          <Link
            to={'/login'}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
        <Field orientation={'horizontal'}>
          <LoadingButton
            isLoading={isPending}
            type="submit"
            form="signup-form"
            className="w-full"
          >
            Create Account
          </LoadingButton>
        </Field>
      </CardFooter>
    </AuthCard>
  )
}
