import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";

// Logout Response Schema
export const LogoutSuccessResponseDto = createSuccessResponse(
  z.null(),
  "LogoutSuccessResponseBody",
  "Logged out successfully, and sessions is terminated.",
  null,
  "Logged out successfully."
);

export const LogoutResponseDto = z.discriminatedUnion("type", [
  LogoutSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type LogoutResponseDtoType = z.infer<typeof LogoutResponseDto>;
