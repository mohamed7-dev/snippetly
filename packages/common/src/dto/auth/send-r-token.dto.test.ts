import { describe, expect, it } from "vitest";
import { GlobalErrorResponseDto } from "../zod";
import {
  SendRTokenRequestDto,
  SendRTokenRequestDtoType,
  SendRTokenResponseDto,
  SendRTokenResponseDtoType,
  SendRTokenSuccessResponseDto,
} from "./send-r-token.dto";

describe("SendRTokenRequestDto", () => {
  it("should validate a valid request", () => {
    const input = {
      email: "test@example.com",
    } satisfies SendRTokenRequestDtoType;

    const result = SendRTokenRequestDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result?.data).toEqual({ email: "test@example.com" });
  });

  it("should strip unknown fields", () => {
    const input = {
      email: "test@example.com",
      extra: "ignored",
      foo: 123,
    };

    const result = SendRTokenRequestDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ email: "test@example.com" });
  });

  it("should fail when email is missing", () => {
    const input = {};

    const result = SendRTokenRequestDto.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should fail when email is invalid", () => {
    const input = { email: "not-email" };

    const result = SendRTokenRequestDto.safeParse(input);

    expect(result.success).toBe(false);
  });
});

describe("SendRTokenResponseDto", () => {
  it("should validate a success response", () => {
    const input = {
      type: "success",
      status: 200,
      message:
        "Password reset link has been sent to {{email}}, check your inbox to reset your password.",
      data: null,
    } satisfies SendRTokenResponseDtoType["success"];

    const result = SendRTokenSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should strip unknown fields in success response", () => {
    const input = {
      type: "success",
      status: 200,
      message:
        "Password reset link has been sent to {{email}}, check your inbox to reset your password.",
      data: null,
      extra: "remove-me",
    };

    const result = SendRTokenSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("extra");
  });

  it("should validate an error response", () => {
    const input = {
      type: "error",
      status: 400,
      message: "Bad Request: Invalid request body",
      cause: {}, // zod error
    } satisfies SendRTokenResponseDtoType["error"];

    const result = GlobalErrorResponseDto.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should discriminate correctly between success and error", () => {
    const successInput = {
      type: "success",
      status: 200,
      message:
        "Password reset link has been sent to {{email}}, check your inbox to reset your password.",
      data: null,
    } satisfies SendRTokenResponseDtoType["success"];

    const errorInput = {
      type: "error",
      status: 400,
      message: "Bad Request: Invalid request body",
      cause: {}, // zod error
    } satisfies SendRTokenResponseDtoType["error"];

    const successResult = SendRTokenResponseDto.safeParse(successInput);
    const errorResult = SendRTokenResponseDto.safeParse(errorInput);

    expect(successResult.success).toBe(true);
    expect(successResult.data?.status).toBe(200);

    expect(errorResult.success).toBe(true);
    expect(errorResult.data?.status).toBe(400);
  });
});
