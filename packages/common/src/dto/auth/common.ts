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

const CommonUserResDtoExample = {
  name: "John_doe7",
  firstName: "John",
  lastName: "Doe",
  image: "https://uploadthing...",
  imageKey: "{{key}}",
  email: "test@example.com",
  createdAt: new Date().toISOString() as unknown as Date,
  updatedAt: new Date().toISOString() as unknown as Date,
  isPrivate: false,
} satisfies z.infer<typeof CommonUserResponse>;

export const CommonAuthResponseDto = z.object({
  user: CommonUserResponse,
  accessToken: z.jwt(),
});

export const CommonAuthResponseDtoExample = {
  user: CommonUserResDtoExample,
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
} satisfies z.infer<typeof CommonAuthResponseDto>;

export const SendTokenViaEmailDto = SelectUserDto.pick({
  email: true,
});

export const VerifyTokenRequestDto = z.object({
  token: z.uuidv4(),
});

export const protectedRouteCookiesSchema = z.object({
  "refresh-token": z.string(),
});

export const protectedRouteHeadersSchema = z.object({
  authorization: z.string(),
});
