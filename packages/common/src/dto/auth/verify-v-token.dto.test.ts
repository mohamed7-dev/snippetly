import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { GlobalErrorResponseDto } from "../zod";
import {
  VerifyVTokenRequestDto,
  VerifyVTokenRequestDtoType,
  VerifyVTokenResponseDto,
  VerifyVTokenResponseDtoType,
  VerifyVTokenSuccessResponseDto,
} from "./verify-v-token.dto";

const uuid = randomUUID();

describe("VerifyVTokenRequestDto", () => {
  it("should parse a valid request", () => {
    const input = { token: uuid } satisfies VerifyVTokenRequestDtoType;

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
    } satisfies VerifyVTokenResponseDtoType["success"];

    const result = VerifyVTokenSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("success");
    expect(result.data?.status).toBe(200);
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
    } satisfies VerifyVTokenResponseDtoType["error"];

    const result = GlobalErrorResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("error");
    expect(result.data?.status).toBe(400);
  });

  it("should discriminate between success and error responses", () => {
    const successInput = {
      type: "success",
      status: 200,
      message: "Email has been verified successfully",
      data: null,
    } satisfies VerifyVTokenResponseDtoType["success"];

    const errorInput = {
      type: "error",
      message: "Bad Request: Invalid query param",
      status: 400,
      cause: {}, // zod error
    } satisfies VerifyVTokenResponseDtoType["error"];

    const success = VerifyVTokenResponseDto.safeParse(successInput);
    const error = VerifyVTokenResponseDto.safeParse(errorInput);

    expect(success.data?.status).toBe(200);
    expect(error.data?.status).toBe(400);
  });
});
