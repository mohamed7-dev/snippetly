import z from "zod";
import { SelectUserDto } from "../../user/dto/select-user.dto";

// Login
export const LoginResponseDto = z.object({
  user: SelectUserDto.omit({ password: true, refreshTokens: true }),
  accessToken: z.jwt(),
});

export type LoginResponseDto = z.infer<typeof LoginResponseDto>;

// Signup
export const SignupResponseDto = LoginResponseDto;

export type SignupResponseDtoType = z.infer<typeof SignupResponseDto>;

// Refresh Token
export const RefreshTokenResDto = LoginResponseDto;

export type RefreshTokenDtoResType = z.infer<typeof RefreshTokenResDto>;
