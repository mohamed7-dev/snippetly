import { CommonUserResDtoExample } from "./common";
import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonUserResDto } from "./common";
import { SelectUserDto } from "./select-user.dto";
import { UpdateUserPasswordDto } from "./update-password.dto";

// Update User Request
export const UpdateUserRequestDto = SelectUserDto.pick({
  firstName: true,
  lastName: true,
  bio: true,
  image: true,
  imageCustomId: true,
  imageKey: true,
  isPrivate: true,
  email: true,
})
  .extend(UpdateUserPasswordDto.omit({ email: true }).shape)
  .partial()
  .meta({
    id: "UpdateUserRequestBody",
    description: "update user request body",
    example: {
      firstName: "updated first name",
      lastName: "updated last name",
      bio: "updated bio",
      image: "url",
      imageCustomId: "id",
      imageKey: "key",
      isPrivate: true,
      email: "test@example.com",
    },
  });

export type UpdateUserRequestDtoType = z.infer<typeof UpdateUserRequestDto>;

// Update User Response

export const UpdateUserSuccessResponseDto = createSuccessResponse(
  CommonUserResDto,
  "UpdateUserSuccessResponseBody",
  "Update user success response body",
  {
    ...CommonUserResDtoExample,
  },
  "User info has been updated successfully"
);

export const UpdateUserResponseDto = z.discriminatedUnion("type", [
  UpdateUserSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type UpdateUserResponseDtoType = z.infer<typeof UpdateUserResponseDto>;
