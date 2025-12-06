import { SelectUserDto } from "../user/select-user.dto";
import { z } from "../zod";

const CommonUserResponse = SelectUserDto.pick({
  name: true,
  firstName: true,
  lastName: true,
  email: true,
  image: true,
  imageCustomId: true,
  imageKey: true,
  isPrivate: true,
  createdAt: true,
  updatedAt: true,
});

export const CommonAuthResponseDto = z.object({
  user: CommonUserResponse,
  accessToken: z.jwt(),
});

export const accessTokenExample =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";

export const SendTokenViaEmailDto = SelectUserDto.pick({
  email: true,
});

export const VerifyTokenRequestDto = z.object({
  token: z.uuid(),
});

export const protectedRouteCookiesSchema = z
  .object({
    "refresh-token": z.string(),
  })
  .meta({
    id: "ProtectedRoutesCookies",
    description: "Protected routes cookies",
    example: {
      authorization: accessTokenExample,
    },
  });

export const protectedRouteHeadersSchema = z
  .object({
    authorization: z.string().nonoptional(),
  })
  .meta({
    id: "ProtectedRoutesHeaders",
    description: "Protected routes headers",
    example: {
      authorization: accessTokenExample,
    },
  });
