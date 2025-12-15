import z from "zod";
import {
  UPLOAD_THING_KEY_EXAMPLE,
  UPLOAD_THING_URL_EXAMPLE,
} from "../user/common";
import {
  BadRequestErrorResponseDto,
  BadRequestErrorResponseDtoType,
  createSuccessResponse,
  RateLimiterErrorResponseDto,
  RateLimiterErrorResponseDtoType,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  UnAuthorizedErrorResponseDtoType,
} from "../zod";
import { accessTokenExample, CommonAuthResponseDto } from "./common";
import { SignupRequestDto } from "./signup.dto";

// Login Request DTO
const LoginRequest = SignupRequestDto.pick({
  password: true,
  name: true,
}).extend({
  rememberMe: z.boolean().optional().default(false),
});
export const LoginRequestDto = LoginRequest.meta({
  id: "LoginRequestBody",
  description: "Login request body",
  example: {
    name: "john_doe20",
    password: "Password@12345678",
    rememberMe: true,
  } satisfies z.infer<typeof LoginRequest>,
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
      image: UPLOAD_THING_URL_EXAMPLE,
      imageKey: UPLOAD_THING_KEY_EXAMPLE,
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
    | RateLimiterErrorResponseDtoType
    | BadRequestErrorResponseDtoType<LoginRequestDtoType>
    | UnAuthorizedErrorResponseDtoType;
};
