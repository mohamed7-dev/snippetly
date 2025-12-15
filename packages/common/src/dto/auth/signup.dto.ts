import { CreateUserDto } from "../user/create-user.dto";
import {
  BadRequestErrorResponseDto,
  BadRequestErrorResponseDtoType,
  createConflictResponse,
  createCreatedResponse,
  RateLimiterErrorResponseDto,
  RateLimiterErrorResponseDtoType,
  SharedErrorResDto,
  SharedErrorResDtoType,
  z,
} from "../zod";
import { accessTokenExample, CommonAuthResponseDto } from "./common";

// Signup Request DTO
export const SignupRequestDto = CreateUserDto.meta({
  id: "SignupRequestBody",
  description: "Signup request body",
  example: {
    name: "john_doe20",
    password: "Password@12345678",
    email: "test@example.com",
    acceptedPolicies: true,
    isPrivate: false,
  } satisfies z.infer<typeof CreateUserDto>,
});

export type SignupRequestDtoType = z.infer<typeof SignupRequestDto>;

// Signup Response Schemas
export const SignupConflictResponseDto = createConflictResponse(
  z.object({
    suggestedNames: z.array(z.string()),
  }),
  "SignupConflictResponse",
  "Signup response body when conflict exists",
  {
    suggestedNames: ["john_doe20-2", "john_doe20-3", "john_doe20-4"],
  },
  "User account with the same name {{name}} already exists, but you can use one of the generated names."
);

const SignupSuccessRes = z.object({
  user: CommonAuthResponseDto.shape.user.omit({
    updatedAt: true,
  }),
  accessToken: CommonAuthResponseDto.shape.accessToken,
});

export const SignupSuccessResponseDto = createCreatedResponse(
  SignupSuccessRes,
  "SignupSuccessResponseBody",
  "Signup response body if the user account created successfully",
  {
    accessToken: accessTokenExample,
    user: {
      name: "John_doe20",
      firstName: null,
      lastName: null,
      image: null,
      imageKey: null,
      email: "test@example.com",
      createdAt: new Date().toISOString() as unknown as Date,
      isPrivate: false,
    },
  } satisfies z.infer<typeof SignupSuccessRes>,
  "User account has been created successfully."
);

export const SignupResponseDto = z.discriminatedUnion("status", [
  SignupSuccessResponseDto,
  SignupConflictResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
]);

export type SignupResponseDtoType = {
  success: z.infer<typeof SignupSuccessResponseDto>;
  conflict: z.infer<typeof SignupConflictResponseDto>;
  error:
    | SharedErrorResDtoType
    | BadRequestErrorResponseDtoType<SignupRequestDtoType>
    | RateLimiterErrorResponseDtoType;
};
