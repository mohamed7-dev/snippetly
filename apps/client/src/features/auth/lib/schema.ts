import { STRONG_PASSWORD_SCHEMA } from '@/lib/zod'
import { z } from 'zod'

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .regex(/^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/, {
    message:
      "Name can only contain letters, numbers, and use '-' or '_' as separators",
  })

const commonSchema = z.object({
  name: nameSchema,
  password: STRONG_PASSWORD_SCHEMA,
})

// Signup
export const signupSchema = z
  .object({
    passwordConfirm: z.string(),
    firstName: z.string().nonempty().min(1, 'First name is required.'),
    lastName: z.string().nonempty().min(1, 'Last name is required.'),
    email: z.string().email(),
    acceptedPolicies: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service',
    }),
    isPrivate: z.boolean(),
  })
  .extend(commonSchema.shape)
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['passwordConfirm'],
      })
    }
    return data
  })

export type SignupSchema = z.infer<typeof signupSchema>

// Login
export const loginSchema = z
  .object({
    rememberMe: z.boolean(),
  })
  .extend(commonSchema.shape)

export type LoginSchema = z.infer<typeof loginSchema>

// send v token
export const sendVerificationTokenSchema = z.object({
  email: z.string().email(),
})

export type SendVerificationTokenSchema = z.infer<
  typeof sendVerificationTokenSchema
>

// verify email
export const verifyEmailSchema = z.object({
  token: z.string(),
})

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>

// send reset token
export const sendResetTokenSchema = z.object({
  email: z.string().email(),
})

export type SendResetTokenSchema = z.infer<typeof sendResetTokenSchema>

// reset password
export const resetPasswordSchema = z.object({
  password: STRONG_PASSWORD_SCHEMA,
  token: z.string(),
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

// search schema
export const searchSchema = z.object({
  token: z.string().uuid().catch(''),
})
