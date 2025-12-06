import { describe, it, expect } from "vitest";
import {
  VerifyRTokenRequestQueryDto,
  VerifyRTokenRequestBodyDto,
  VerifyRTokenSuccessResponseDto,
  VerifyRTokenResponseDto,
} from "./verify-r-token.dto";
import { GlobalErrorResponseDto } from "../zod";
import { randomUUID } from "node:crypto";
import z from "zod";

const uuid = randomUUID();

describe("VerifyRTokenRequestQueryDto", () => {
  it("should validate a valid query", () => {
    const input = { token: uuid };

    const result = VerifyRTokenRequestQueryDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ token: uuid });
  });

  it("should strip unknown fields", () => {
    const input = {
      token: uuid,
      extra: "ignored",
    };

    const result = VerifyRTokenRequestQueryDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ token: uuid });
  });

  it("should fail if token is missing", () => {
    const result = VerifyRTokenRequestQueryDto.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe("VerifyRTokenRequestBodyDto", () => {
  it("should validate a valid body", () => {
    const input = { password: "ValidPass123!@" };

    const result = VerifyRTokenRequestBodyDto.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should strip unknown fields", () => {
    const input = {
      password: "ValidPass123!@",
      foo: "bar",
    };

    const result = VerifyRTokenRequestBodyDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ password: "ValidPass123!@" });
  });

  it("should fail when password is invalid", () => {
    const input = { password: "short" };

    const result = VerifyRTokenRequestBodyDto.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should fail when password is missing", () => {
    const result = VerifyRTokenRequestBodyDto.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe("VerifyRTokenResponseDto", () => {
  it("should validate a success response", () => {
    const input = {
      type: "success",
      status: 200,
      message: "Password has been reset successfully",
      data: null,
    } satisfies z.infer<typeof VerifyRTokenSuccessResponseDto>;

    const result = VerifyRTokenSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should strip unknown fields in success response", () => {
    const input = {
      type: "success",
      status: 200,
      message: "Password has been reset successfully",
      data: null,
      extra: "removed",
    };

    const result = VerifyRTokenSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("extra");
    }
  });

  it("should validate an error response", () => {
    const input = {
      type: "error",
      status: 400,
      message: "Bad Request: Invalid request body or query params",
      cause: {}, // zod error
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

    const result = GlobalErrorResponseDto.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should discriminate correctly between success and error", () => {
    const successInput = {
      type: "success",
      status: 200,
      message: "Password has been reset successfully",
      data: null,
    } satisfies z.infer<typeof VerifyRTokenSuccessResponseDto>;

    const errorInput = {
      type: "error",
      status: 400,
      message: "Bad Request: Invalid request body or query params",
      cause: {}, // zod error
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

    const successResult = VerifyRTokenResponseDto.safeParse(successInput);
    const errorResult = VerifyRTokenResponseDto.safeParse(errorInput);

    expect(successResult.success).toBe(true);
    if (successResult.success) {
      expect(successResult.data.type).toBe("success");
    }

    expect(errorResult.success).toBe(true);
    if (errorResult.success) {
      expect(errorResult.data.type).toBe("error");
    }
  });
});
