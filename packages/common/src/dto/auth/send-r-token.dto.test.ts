import { describe, it, expect } from "vitest";
import {
  SendRTokenRequestDto,
  SendRTokenResponseDto,
  SendRTokenSuccessResponseDto,
} from "./send-r-token.dto";
import { GlobalErrorResponseDto } from "../zod";
import z from "zod";

describe("SendRTokenRequestDto", () => {
  it("should validate a valid request", () => {
    const input = { email: "test@example.com" };

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
    } satisfies z.infer<typeof SendRTokenSuccessResponseDto>;

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
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

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
    } satisfies z.infer<typeof SendRTokenSuccessResponseDto>;

    const errorInput = {
      type: "error",
      status: 400,
      message: "Bad Request: Invalid request body",
      cause: {}, // zod error
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

    const successResult = SendRTokenResponseDto.safeParse(successInput);
    const errorResult = SendRTokenResponseDto.safeParse(errorInput);

    expect(successResult.success).toBe(true);
    expect(successResult.data?.type).toBe("success");

    expect(errorResult.success).toBe(true);
    expect(errorResult.data?.type).toBe("error");
  });
});
