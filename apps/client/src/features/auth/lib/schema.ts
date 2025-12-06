import { z } from 'zod'
import {
  LoginRequestDto,
  SendRTokenRequestDto,
  SendVEmailRequestDto,
  SignupRequestDto,
  VerifyRTokenRequestBodyDto,
  VerifyRTokenRequestQueryDto,
  VerifyVTokenRequestDto,
} from '@snippetly/common/dto'

// Signup
export const signupSchema = SignupRequestDto.required({
  isPrivate: true,
  acceptedPolicies: true,
})
  .extend({
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: 'invalid_value',
        message: 'Passwords do not match',
        path: ['passwordConfirm'],
        values: [data.passwordConfirm, data.password],
      })
    }
  })

export type SignupSchema = z.infer<typeof signupSchema>

// Login
export const loginSchema = LoginRequestDto.extend({
  rememberMe: z.boolean(),
})

export type LoginSchema = z.infer<typeof loginSchema>

// send v token
export const sendVerificationTokenSchema = SendVEmailRequestDto

export type SendVerificationTokenSchema = z.infer<
  typeof sendVerificationTokenSchema
>

// verify email
export const verifyEmailSchema = VerifyVTokenRequestDto

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>

// send reset token
export const sendResetTokenSchema = SendRTokenRequestDto

export type SendResetTokenSchema = z.infer<typeof sendResetTokenSchema>

// reset password
export const resetPasswordSchema = z.object({
  password: VerifyRTokenRequestBodyDto.shape.password,
  token: VerifyRTokenRequestQueryDto.shape.token,
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

// search schema
export const searchSchema = z.object({
  token: z.uuid().catch(''),
})
