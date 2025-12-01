import z from "zod";
import { createSuccessResponse, GlobalErrorResponseDto } from "../zod";
import { SignupRequestDto } from "./signup.dto";
import { CommonAuthResponseDto, CommonAuthResponseDtoExample } from "./common";

// Login Request DTO
export const LoginRequestDto = SignupRequestDto.pick({
  password: true,
  name: true,
})
  .extend({
    rememberMe: z.boolean().optional(),
  })
  .meta({
    id: "LoginRequestBody",
    description: "Login request body",
    example: {
      name: "alice",
      password: "Password@12345678",
      rememberMe: true,
    },
  });

export type LoginRequestDtoType = z.infer<typeof LoginRequestDto>;

// Login Response Schemas

export const LoginSuccessResponseDto = createSuccessResponse(
  CommonAuthResponseDto,
  "LoginSuccessResponseBody",
  "Login response body when login is successful",
  {
    ...CommonAuthResponseDtoExample,
  },
  "Successfully authenticated"
);

export type LoginSuccessResponseDtoType = z.infer<
  typeof LoginSuccessResponseDto
>;

export const LoginResponseDto = z.discriminatedUnion("type", [
  LoginSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type LoginResponseDtoType = z.infer<typeof LoginResponseDto>;
