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
  z,
} from "../zod";
import { accessTokenExample, VerifyTokenRequestDto } from "./common";

// Verify V Token Request Schema
export const VerifyVTokenRequestDto = VerifyTokenRequestDto.meta({
  id: "VerifyEmailVTokenRequestQuery",
  description: "Verify email verification token request query param",
  example: {
    token: accessTokenExample,
  } satisfies z.infer<typeof VerifyTokenRequestDto>,
});
export type VerifyVTokenRequestDtoType = z.infer<typeof VerifyVTokenRequestDto>;

// Verify V Token Response Schema
export const VerifyVTokenSuccessResponseDto = createSuccessResponse(
  z.null(),
  "VerifyEmailVTokenSuccessResponse",
  "Email verification response body",
  null,
  "Email has been verified successfully"
);

export const VerifyVTokenResponseDto = z.discriminatedUnion("status", [
  VerifyVTokenSuccessResponseDto,
  RateLimiterErrorResponseDto,
  BadRequestErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ...SharedErrorResDto,
]);

export type VerifyVTokenResponseDtoType = {
  success: z.infer<typeof VerifyVTokenSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | BadRequestErrorResponseDtoType<VerifyVTokenRequestDtoType>
    | RateLimiterErrorResponseDtoType
    | UnAuthorizedErrorResponseDtoType;
};
