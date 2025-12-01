import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { VerifyTokenRequestDto } from "./common";

// Verify V Token Request Schema
export const VerifyVTokenRequestDto = VerifyTokenRequestDto.meta({
  id: "VerifyEmailVTokenRequestQuery",
  description: "Verify email verification token request query param",
  example: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
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

export const VerifyVTokenResponseDto = z.discriminatedUnion("type", [
  VerifyVTokenSuccessResponseDto,
  GlobalErrorResponseDto,
]);
export type VerifyVTokenResponseDtoType = z.infer<
  typeof VerifyVTokenResponseDto
>;
