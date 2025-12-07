import { describe, expect, it } from "vitest";
import { z } from "zod";
import { GlobalErrorResponseDto } from "../zod";
import {
  SendVEmailRequestDto,
  SendVEmailResponseDto,
  SendVEmailResponseDtoType,
  SendVEmailSuccessResponseDto,
} from "./send-v-token.dto";

describe("SendVEmailRequestDto", () => {
  it("should parse a valid request body", () => {
    const input = { email: "test@example.com" };
    const result = SendVEmailRequestDto.parse(input);

    expect(result).toEqual({ email: "test@example.com" });
  });

  it("should strip extra fields", () => {
    const input = {
      email: "test@example.com",
      foo: "bar",
      something: 123,
    };

    const result = SendVEmailRequestDto.safeParse(input);

    expect(result.data).toEqual({ email: "test@example.com" });
  });

  it("should fail with invalid email", () => {
    expect(() => SendVEmailRequestDto.parse({ email: "not-an-email" })).toThrow(
      z.ZodError
    );
  });
});

describe("SendVEmailResponseDto", () => {
  it("should validate success response", () => {
    const input = {
      type: "success",
      status: 200,
      message:
        "Email verification has been sent to {{email}}, check your inbox to verify your account.",
      data: null,
    } satisfies SendVEmailResponseDtoType["success"];

    const result = SendVEmailSuccessResponseDto.safeParse(input);

    expect(result.data?.status).toBe(200);
    expect(result.data?.data).toBeNull();
  });

  it("should strip extra fields in success response", () => {
    const input = {
      type: "success",
      status: 200,
      message:
        "Email verification has been sent to {{email}}, check your inbox to verify your account.",
      data: null,
      extra: "value",
    };

    const result = SendVEmailSuccessResponseDto.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("extra");
  });

  it("should validate error response", () => {
    const input = {
      type: "error",
      status: 400,
      message: "Bad Request: Invalid request body",
      cause: {}, // zod error instance
    } satisfies SendVEmailResponseDtoType["error"];

    const result = GlobalErrorResponseDto.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe(400);
  });

  it("should correctly discriminate between success and error", () => {
    const successInput = {
      type: "success",
      status: 200,
      message:
        "Email verification has been sent to {{email}}, check your inbox to verify your account.",
      data: null,
    } satisfies SendVEmailResponseDtoType["success"];

    const errorInput = {
      type: "error",
      message: "Bad Request: Invalid request body",
      status: 400,
      cause: {},
    } satisfies SendVEmailResponseDtoType["error"];

    const success = SendVEmailResponseDto.safeParse(successInput);
    const error = SendVEmailResponseDto.safeParse(errorInput);

    expect(success.data?.status).toBe(200);
    expect(error.data?.status).toBe(400);
  });
});
