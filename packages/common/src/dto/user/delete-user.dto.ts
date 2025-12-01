import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";

// Delete User Response
export const DeleteUserSuccessResponseDto = createSuccessResponse(
  z.null(),
  "DeleteUserSuccessResponseBody",
  "Delete user success response body",
  null,
  "User account has been deleted successfully"
);

export const DeleteUserResponseDto = z.discriminatedUnion("type", [
  DeleteUserSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type DeleteUserResponseDtoType = z.infer<typeof DeleteUserResponseDto>;
