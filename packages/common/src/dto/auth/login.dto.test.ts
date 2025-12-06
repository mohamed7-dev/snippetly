import { describe, it, expect } from "vitest";
import { z } from "zod";
import { LoginRequestDto, LoginSuccessResponseDto } from "./login.dto";
import { accessTokenExample } from "./common";

describe("LoginRequestDto", () => {
  it("validates a correct login request", () => {
    const input = {
      name: "john_doe20",
      password: "Password@12345678",
      rememberMe: true,
    };

    const result = LoginRequestDto.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(input);
  });

  it("fails with wrong types", () => {
    const input = {
      name: 123,
      password: ["abc"],
      rememberMe: "yes",
    };

    const result = LoginRequestDto.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("LoginSuccessResponseDto", () => {
  it("validates a proper success response", () => {
    const validResponse = {
      type: "success",
      status: 200,
      message: "Successfully authenticated",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "John_doe20",
          firstName: "john",
          lastName: "doe",
          image: null,
          imageKey: null,
          imageCustomId: null,
          email: "test@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
        },
      },
    } satisfies z.infer<typeof LoginSuccessResponseDto>;
    const result = LoginSuccessResponseDto.safeParse(validResponse);

    expect(result.success).toBe(true);
    expect(result.data?.data.user.email).toBe("test@example.com");
  });

  it("fails if status or user is missing", () => {
    const invalidResponse = {
      type: "success",
      message: "Successfully authenticated",
      data: {
        accessToken: "token",
      },
    };

    const result = LoginSuccessResponseDto.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it("strips out email verification token field", () => {
    const validResponseWithExtraField = {
      type: "success",
      status: 200,
      message: "Successfully authenticated",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "John_doe20",
          firstName: "john",
          lastName: "doe",
          image: null,
          imageKey: null,
          imageCustomId: null,
          email: "test@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
          emailVerificationToken: "eyasnbdkabdkadbkb", // this should be stripped out from res object
        },
      },
    };

    const result = LoginSuccessResponseDto.safeParse(
      validResponseWithExtraField
    );
    expect(result.success).toBe(true); // validation is successful
    expect(result.data?.data.user).not.toHaveProperty("emailVerificationToken");
  });
});
