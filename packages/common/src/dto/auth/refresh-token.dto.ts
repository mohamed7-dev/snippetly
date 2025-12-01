import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonAuthResponseDto, CommonAuthResponseDtoExample } from "./common";

// Refresh Token Response Schemas
export const RefreshTokenSuccessResponseDto = createSuccessResponse(
  CommonAuthResponseDto,
  "RefreshTokenSuccessResponse",
  "Access token has been generated successfully from the refresh token.",
  {
    ...CommonAuthResponseDtoExample,
  },
  "Access token has been refreshed successfully."
);

export type RefreshTokenSuccessResponseDtoType = z.infer<
  typeof RefreshTokenSuccessResponseDto
>;

export const RefreshTokenResponseDto = z.discriminatedUnion("type", [
  RefreshTokenSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type RefreshTokenResponseDtoType = z.infer<
  typeof RefreshTokenResponseDto
>;
