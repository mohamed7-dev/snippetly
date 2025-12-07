import { SelectUserDto } from "../user/select-user.dto";
import {
  BadRequestErrorResponseDto,
  createSuccessResponse,
  RateLimiterErrorResponseDto,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  z,
} from "../zod";
import { accessTokenExample, VerifyTokenRequestDto } from "./common";

// Verify R Token Request Schema <Query Param>
export const VerifyRTokenRequestQueryDto = VerifyTokenRequestDto.meta({
  id: "VerifyRTokenRequestQuery",
  description: "Verify password reset token request query param",
  example: {
    token: accessTokenExample,
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
      password: "{{password}}",
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

export const VerifyRTokenResponseDto = z.discriminatedUnion("status", [
  VerifyRTokenSuccessResponseDto,
  RateLimiterErrorResponseDto,
  BadRequestErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ...SharedErrorResDto,
]);

export type VerifyRTokenResponseDtoType = {
  success: z.infer<typeof VerifyRTokenSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | z.infer<typeof BadRequestErrorResponseDto>
    | z.infer<typeof RateLimiterErrorResponseDto>
    | z.infer<typeof UnauthorizedErrorResponseDto>;
};
