import { z } from "zod";
import { describe, it, expect } from "vitest";
import {
  SendVEmailRequestDto,
  SendVEmailResponseDto,
  SendVEmailSuccessResponseDto,
} from "./send-v-token.dto";
import { GlobalErrorResponseDto } from "../zod";

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

    // Only email should remain (Zod strips unknown keys by default)
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
    } satisfies z.infer<typeof SendVEmailSuccessResponseDto>;

    const result = SendVEmailSuccessResponseDto.safeParse(input);

    expect(result.data?.type).toBe("success");
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
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

    const result = GlobalErrorResponseDto.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("error");
  });

  it("should correctly discriminate between success and error", () => {
    const successInput = {
      type: "success",
      status: 200,
      message:
        "Email verification has been sent to {{email}}, check your inbox to verify your account.",
      data: null,
    } satisfies z.infer<typeof SendVEmailSuccessResponseDto>;

    const errorInput = {
      type: "error",
      message: "Bad Request: Invalid request body",
      status: 400,
      cause: {},
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

    const success = SendVEmailResponseDto.safeParse(successInput);
    const error = SendVEmailResponseDto.safeParse(errorInput);

    expect(success.data?.type).toBe("success");
    expect(error.data?.type).toBe("error");
  });
});
