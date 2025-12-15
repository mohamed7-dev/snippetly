import {
  createSuccessResponse,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  UnAuthorizedErrorResponseDtoType,
  z,
} from "../zod";

// Logout Response Schema
export const LogoutSuccessResponseDto = createSuccessResponse(
  z.null(),
  "LogoutSuccessResponseBody",
  "Logged out successfully, and sessions is terminated.",
  null,
  "Logged out successfully."
);

export const LogoutResponseDto = z.discriminatedUnion("status", [
  LogoutSuccessResponseDto,
  UnauthorizedErrorResponseDto,
  ...SharedErrorResDto,
]);

export type LogoutResponseDtoType = {
  success: z.infer<typeof LogoutSuccessResponseDto>;
  error: SharedErrorResDtoType | UnAuthorizedErrorResponseDtoType;
};
