import { SelectUserDto } from "../user/select-user.dto";
import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { VerifyTokenRequestDto } from "./common";

// Verify R Token Request Schema <Query Param>
export const VerifyRTokenRequestQueryDto = VerifyTokenRequestDto.meta({
  id: "VerifyRTokenRequestQuery",
  description: "Verify password reset token request query param",
  example: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
});

export type VerifyRTokenRequestQueryDtoType = z.infer<
  typeof VerifyRTokenRequestQueryDto
>;

// Verify R Token Request Schema <Body>
export const VerifyRTokenRequestBodyDto = z
  .object({
    password: SelectUserDto.shape.password,
  })
  .meta({
    id: "VerifyRTokenRequestBody",
    description: "Verify password reset token request body",
    example: {
      password: "super-secure-password",
    },
  });

export type VerifyRTokenRequestBodyDtoType = z.infer<
  typeof VerifyRTokenRequestBodyDto
>;

// Verify V Token Response Schema
export const VerifyRTokenSuccessResponseDto = createSuccessResponse(
  z.null(),
  "VerifyPasswordRTokenSuccessResponse",
  "password reset response body",
  null,
  "Password has been reset successfully"
);

export const VerifyRTokenResponseDto = z.discriminatedUnion("type", [
  VerifyRTokenSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type VerifyRTokenResponseDtoType = z.infer<
  typeof VerifyRTokenResponseDto
>;
