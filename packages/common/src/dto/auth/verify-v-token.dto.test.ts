import { describe, it, expect } from "vitest";
import {
  VerifyVTokenRequestDto,
  VerifyVTokenResponseDto,
  VerifyVTokenSuccessResponseDto,
} from "./verify-v-token.dto";
import { GlobalErrorResponseDto } from "../zod";
import { z } from "zod";
import { randomUUID } from "node:crypto";

const uuid = randomUUID();

describe("VerifyVTokenRequestDto", () => {
  it("should parse a valid request", () => {
    const input = { token: uuid };

    const result = VerifyVTokenRequestDto.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should strip unknown fields", () => {
    const input = {
      token: uuid,
      foo: "bar",
      another: 123,
    };

    const result = VerifyVTokenRequestDto.safeParse(input);

    expect(result.data).toEqual({ token: uuid });
  });

  it("should throw when missing token", () => {
    expect(() => VerifyVTokenRequestDto.parse({})).toThrow(z.ZodError);
  });
});

describe("VerifyVTokenResponseDto", () => {
  it("should validate a success response", () => {
    const input = {
      type: "success",
      status: 200,
      message: "Email has been verified successfully",
      data: null,
    } satisfies z.infer<typeof VerifyVTokenSuccessResponseDto>;

    const result = VerifyVTokenSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("success");
    expect(result.data?.data).toBeNull();
  });

  it("should strip extra fields in success response", () => {
    const input = {
      type: "success",
      status: 200,
      message: "Email verification response body",
      data: null,
      extra: "ignored",
    };
    const result = VerifyVTokenSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("extra");
  });

  it("should validate an error response", () => {
    const input = {
      type: "error",
      message: "Bad Request: Invalid query param",
      status: 400,
      cause: {}, // zod error
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

    const result = GlobalErrorResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("error");
  });

  it("should discriminate between success and error responses", () => {
    const successInput = {
      type: "success",
      status: 200,
      message: "Email has been verified successfully",
      data: null,
    } satisfies z.infer<typeof VerifyVTokenSuccessResponseDto>;

    const errorInput = {
      type: "error",
      message: "Bad Request: Invalid query param",
      status: 400,
      cause: {}, // zod error
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

    const success = VerifyVTokenResponseDto.safeParse(successInput);
    const error = VerifyVTokenResponseDto.safeParse(errorInput);

    expect(success.data?.type).toBe("success");
    expect(error.data?.type).toBe("error");
  });
});
