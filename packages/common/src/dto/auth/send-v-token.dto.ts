import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { SendTokenViaEmailDto } from "./common";

// Send V Email Request Schema
export const SendVEmailRequestDto = SendTokenViaEmailDto.meta({
  id: "SendVEmailTokenRequestBody",
  description: "Send email verification token request body",
  example: {
    email: "test@example.com",
  },
});

export type SendVEmailRequestDtoType = z.infer<typeof SendVEmailRequestDto>;

// Send V Email Response Schema
export const SendVEmailSuccessResponseDto = createSuccessResponse(
  z.null(),
  "SendVEmailSuccessResponseBody",
  "Verification link has been sent the email",
  null,
  "Email verification has been sent to {{email}}, check your inbox to verify your account."
);

export const SendVEmailResponseDto = z.discriminatedUnion("type", [
  SendVEmailSuccessResponseDto,
  GlobalErrorResponseDto,
]);
export type SendVEmailResponseDtoType = z.infer<typeof SendVEmailResponseDto>;
