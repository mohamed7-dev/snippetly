import {
  BadRequestErrorResponseDto,
  BadRequestErrorResponseDtoType,
  createSuccessResponse,
  RateLimiterErrorResponseDto,
  RateLimiterErrorResponseDtoType,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  UnAuthorizedErrorResponseDtoType,
  z,
} from "../zod";
import {
  CommonUserResDto,
  UPLOAD_THING_KEY_EXAMPLE,
  UPLOAD_THING_URL_EXAMPLE,
} from "./common";
import { SelectUserDto } from "./select-user.dto";
import { UpdateUserPasswordDto } from "./update-password.dto";

const UpdateUserRequest = SelectUserDto.pick({
  firstName: true,
  lastName: true,
  image: true,
  imageKey: true,
  isPrivate: true,
  email: true,
  bio: true,
});

// Update User Request
export const UpdateUserRequestDto = UpdateUserRequest.extend(
  UpdateUserPasswordDto.omit({ email: true }).shape
)
  .partial()
  .meta({
    id: "UpdateUserRequestBody",
    description: "update user request body",
    example: {
      firstName: "john",
      lastName: "doe",
      email: "test@example.com",
      image: UPLOAD_THING_URL_EXAMPLE,
      imageKey: UPLOAD_THING_KEY_EXAMPLE,
      isPrivate: true,
      bio: "I'm a full-stack engineer",
    } satisfies z.infer<typeof UpdateUserRequest>,
  });

export type UpdateUserRequestDtoType = z.infer<typeof UpdateUserRequestDto>;

// Update User Response

export const UpdateUserSuccessResponseDto = createSuccessResponse(
  CommonUserResDto,
  "UpdateUserSuccessResponseBody",
  "Update user success response body",
  {
    name: "John_doe20",
    firstName: "john",
    lastName: "doe",
    image: UPLOAD_THING_URL_EXAMPLE,
    imageKey: UPLOAD_THING_KEY_EXAMPLE,
    email: "test@example.com",
    createdAt: new Date().toISOString() as unknown as Date,
    updatedAt: new Date().toISOString() as unknown as Date,
    isPrivate: false,
  } satisfies z.infer<typeof CommonUserResDto>,
  "User info has been updated successfully"
);

export const UpdateUserResponseDto = z.discriminatedUnion("status", [
  UpdateUserSuccessResponseDto,
  BadRequestErrorResponseDto,
  UnauthorizedErrorResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
]);

export type UpdateUserResponseDtoType = {
  success: z.infer<typeof UpdateUserSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | BadRequestErrorResponseDtoType<UpdateUserRequestDtoType>
    | UnAuthorizedErrorResponseDtoType
    | RateLimiterErrorResponseDtoType;
};
