import {
  createSuccessResponse,
  RateLimiterErrorResponseDto,
  RateLimiterErrorResponseDtoType,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  UnAuthorizedErrorResponseDtoType,
  z,
} from "../zod";

// Delete User Response
export const DeleteUserSuccessResponseDto = createSuccessResponse(
  z.null(),
  "DeleteUserSuccessResponseBody",
  "Delete user success response body",
  null,
  "User account has been deleted successfully"
);

export const DeleteUserResponseDto = z.discriminatedUnion("status", [
  DeleteUserSuccessResponseDto,
  UnauthorizedErrorResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
]);

export type DeleteUserResponseDtoType = {
  success: z.infer<typeof DeleteUserSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | RateLimiterErrorResponseDtoType;
};
