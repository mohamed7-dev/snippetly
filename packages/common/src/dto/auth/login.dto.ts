import z from "zod";
import {
  BadRequestErrorResponseDto,
  createSuccessResponse,
  RateLimiterErrorResponseDto,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
} from "../zod";
import { accessTokenExample, CommonAuthResponseDto } from "./common";
import { SignupRequestDto } from "./signup.dto";

// Login Request DTO
export const LoginRequestDto = SignupRequestDto.pick({
  password: true,
  name: true,
})
  .extend({
    rememberMe: z.boolean().optional().default(false),
  })
  .meta({
    id: "LoginRequestBody",
    description: "Login request body",
    example: {
      name: "john_doe20",
      password: "Password@12345678",
      rememberMe: true,
    },
  });

export type LoginRequestDtoType = z.infer<typeof LoginRequestDto>;

// Login Response Schemas

export const LoginSuccessResponseDto = createSuccessResponse(
  CommonAuthResponseDto,
  "LoginSuccessResponseBody",
  "Login response body if login is successful",
  {
    accessToken: accessTokenExample,
    user: {
      name: "John_doe20",
      firstName: "john",
      lastName: "doe",
      image: null,
      imageKey: null,
      imageCustomId: null,
      email: "test@example.com",
      createdAt: new Date().toISOString() as unknown as Date,
      updatedAt: new Date().toISOString() as unknown as Date,
      isPrivate: false,
    },
  } satisfies z.infer<typeof CommonAuthResponseDto>,
  "Successfully authenticated"
);

export const LoginResponseDto = z.discriminatedUnion("status", [
  LoginSuccessResponseDto,
  RateLimiterErrorResponseDto,
  BadRequestErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ...SharedErrorResDto,
]);

export type LoginResponseDtoType = {
  success: z.infer<typeof LoginSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | z.infer<typeof RateLimiterErrorResponseDto>
    | z.infer<typeof BadRequestErrorResponseDto>
    | z.infer<typeof UnauthorizedErrorResponseDto>;
};
