import { STRONG_PASSWORD_SCHEMA } from '@/lib/zod'
import { z } from 'zod'

const commonSchema = z.object({
  name: z.string().nonempty().trim().min(1, 'User name is required.'),
  password: STRONG_PASSWORD_SCHEMA,
})

// Signup
export const signupSchema = z
  .object({
    passwordConfirm: z.string(),
    firstName: z.string().nonempty().min(1, 'First name is required.'),
    lastName: z.string().nonempty().min(1, 'Last name is required.'),
    email: z.string().email(),
    acceptedPolicies: z.boolean(),
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
