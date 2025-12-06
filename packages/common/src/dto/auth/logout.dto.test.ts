import { describe, it, expect } from "vitest";
import { LogoutSuccessResponseDto, LogoutResponseDto } from "./logout.dto";
import { GlobalErrorResponseDto } from "../zod";
import z from "zod";

describe("LogoutSuccessResponseDto", () => {
  it("validates a correct logout success response", () => {
    const input = {
      type: "success",
      status: 200,
      message: "Logged out successfully.",
      data: null,
    } satisfies z.infer<typeof LogoutSuccessResponseDto>;

    const result = LogoutSuccessResponseDto.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data?.data).toBeNull();
  });

  it("fails when data is not null", () => {
    const input = {
      type: "success",
      status: 200,
      message: "Logged out successfully.",
      data: "not-null",
    };
    const result = LogoutSuccessResponseDto.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("LogoutResponseDto (union)", () => {
  it("accepts a valid success response", () => {
    const result = LogoutResponseDto.safeParse({
      type: "success",
      status: 200,
      message: "Logged out successfully.",
      data: null,
    } satisfies z.infer<typeof LogoutSuccessResponseDto>);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("success");
  });

  it("accepts a valid error response", () => {
    const input = {
      type: "error",
      message: "Unauthorized: Invalid session",
      status: 401,
      cause: null,
    } satisfies z.infer<typeof GlobalErrorResponseDto>;

    const result = LogoutResponseDto.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("error");
  });

  it("fails on unknown type", () => {
    const result = LogoutResponseDto.safeParse({
      type: "weird",
      message: "???",
    });

    expect(result.success).toBe(false);
  });
});
