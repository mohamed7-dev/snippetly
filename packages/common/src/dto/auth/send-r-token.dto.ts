import {
  BadRequestErrorResponseDto,
  createSuccessResponse,
  RateLimiterErrorResponseDto,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  z,
} from "../zod";
import { SendTokenViaEmailDto } from "./common";

// Send Reset Token Request Schema
export const SendRTokenRequestDto = SendTokenViaEmailDto.meta({
  id: "SendRTokenRequestBody",
  description: "Send reset password token request body",
  example: {
    email: "test@example.com",
  },
});
export type SendRTokenRequestDtoType = z.infer<typeof SendRTokenRequestDto>;

// Send Reset Token Response Schema
export const SendRTokenSuccessResponseDto = createSuccessResponse(
  z.null(),
  "SendRTokenSuccessResponseBody",
  "Password reset link has been sent to the email.",
  null,
  "Password reset link has been sent to {{email}}, check your inbox to reset your password."
);

export const SendRTokenResponseDto = z.discriminatedUnion("status", [
  SendRTokenSuccessResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ...SharedErrorResDto,
]);

export type SendRTokenResponseDtoType = {
  success: z.infer<typeof SendRTokenSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | z.infer<typeof BadRequestErrorResponseDto>
    | z.infer<typeof RateLimiterErrorResponseDto>
    | z.infer<typeof UnauthorizedErrorResponseDto>;
};
