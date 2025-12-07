import {
  createSuccessResponse,
  RateLimiterErrorResponseDto,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  z,
} from "../zod";
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

export const RefreshTokenResponseDto = z.discriminatedUnion("status", [
  RefreshTokenSuccessResponseDto,
  UnauthorizedErrorResponseDto,
  RateLimiterErrorResponseDto,
  ...SharedErrorResDto,
]);

export type RefreshTokenResponseDtoType = {
  success: z.infer<typeof RefreshTokenSuccessResponseDto>;
  error:
    | SharedErrorResDtoType
    | z.infer<typeof UnauthorizedErrorResponseDto>
    | z.infer<typeof RateLimiterErrorResponseDto>;
};
