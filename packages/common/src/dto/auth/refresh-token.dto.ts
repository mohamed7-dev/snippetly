import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { accessTokenExample, CommonAuthResponseDto } from "./common";

// Refresh Token Response Schemas
export const RefreshTokenSuccessResponseDto = createSuccessResponse(
  CommonAuthResponseDto,
  "RefreshTokenSuccessResponse",
  "Access token has been generated successfully from the refresh token.",
  {
    accessToken: accessTokenExample,
    user: {
      name: "John_doe20",
      firstName: "john",
      lastName: "doe",
      image: null,
      imageKey: null,
      imageCustomId: null,
      email: "test@example.com",
      createdAt: new Date().toISOString() as unknown as Date,
      updatedAt: new Date().toISOString() as unknown as Date,
      isPrivate: false,
    },
  } satisfies z.infer<typeof CommonAuthResponseDto>,
  "Access token has been refreshed successfully."
);

export const RefreshTokenResponseDto = z.discriminatedUnion("type", [
  RefreshTokenSuccessResponseDto,
  GlobalErrorResponseDto,
]);

export type RefreshTokenResponseDtoType = z.infer<
  typeof RefreshTokenResponseDto
>;
