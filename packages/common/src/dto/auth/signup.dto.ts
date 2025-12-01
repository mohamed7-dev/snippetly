import { CreateUserDto } from "../user/create-user.dto";
import { createConflictResponse, GlobalErrorResponseDto, z } from "../zod";
import { createSuccessResponse } from "../zod";
import { CommonAuthResponseDto, CommonAuthResponseDtoExample } from "./common";

// Signup Request DTO
export const SignupRequestDto = CreateUserDto.meta({
  id: "SignupRequestBody",
  description: "Signup request body",
  example: {
    name: "alice",
    password: "Password@12345678",
    email: "alice@snippetly.com",
    acceptedPolicies: true,
    isPrivate: false,
  },
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
    suggestedNames: ["alice-1", "alice-3", "alice-4"],
  },
  "User account with the same name '${name}' already exists, but you can use one of the generated names."
);

export type SignupConflictResponseDtoType = z.infer<
  typeof SignupConflictResponseDto
>;

const {
  accessToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user: { updatedAt, ...userResExample },
} = CommonAuthResponseDtoExample;
export const SignupSuccessResponseDto = createSuccessResponse(
  z.object({
    user: CommonAuthResponseDto.shape.user.omit({
      updatedAt: true,
    }),
    accessToken: CommonAuthResponseDto.shape.accessToken,
  }),
  "SignupSuccessResponse",
  "Signup response body when conflict does not exist",
  {
    accessToken,
    user: {
      ...userResExample,
    },
  },
  "User account has been created successfully.",
  201
);

export type SignupSuccessResponseDtoType = z.infer<
  typeof SignupSuccessResponseDto
>;

export const SignupResponseDto = z.discriminatedUnion("type", [
  SignupSuccessResponseDto,
  SignupConflictResponseDto,
  GlobalErrorResponseDto,
]);

export type SignupResponseDtoType = z.infer<typeof SignupResponseDto>;
