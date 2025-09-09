import z from 'zod'

// Password
export const STRONG_PASSWORD_TITLE =
  'Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'

export const STRONG_PASSWORD_REQUIREMENTS = [
  'at least 12 characters',
  'at least one uppercase letter',
  'one lowercase letter',
  'one number',
  'one special character',
]
export const STRONG_PASSWORD_SCHEMA = z
  .string()
  .min(12)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    STRONG_PASSWORD_TITLE,
  )
