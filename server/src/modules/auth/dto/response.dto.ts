import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto.ts";

const CommonSchema = SelectUserDto.omit({
  password: true,
  refreshTokens: true,
  emailVerificationToken: true,
  emailVerificationTokenExpiresAt: true,
  resetPasswordToken: true,
  resetPasswordTokenExpiresAt: true,
  id: true,
});

// Login
export const LoginResponseDto = z.object({
  user: CommonSchema.transform((val) => {
    const { name, createdAt, updatedAt, ...rest } = val;
    return {
      ...rest,
      joinedAt: createdAt,
      lastUpdatedAt: updatedAt,
      username: name,
      fullName: rest.firstName.concat(" ", rest.lastName),
    };
  }),
  accessToken: z.jwt(),
});

export type LoginResponseDto = z.infer<typeof LoginResponseDto>;

// Signup
export const SignupResponseDto = z.object({
  user: CommonSchema.omit({
    updatedAt: true,
  })
    .transform((val) => {
      const { name, createdAt, ...rest } = val;
      return {
        ...rest,
        joinedAt: createdAt,
        username: name,
        fullName: rest.firstName.concat(" ", rest.lastName),
      };
    })
    .optional(),
  accessToken: z.string().optional(),
  suggestedNames: z.array(z.string()).optional(),
});

export type SignupResponseDtoType = z.infer<typeof SignupResponseDto>;

// Refresh Token
export const RefreshTokenResDto = LoginResponseDto;

export type RefreshTokenDtoResType = z.infer<typeof RefreshTokenResDto>;
