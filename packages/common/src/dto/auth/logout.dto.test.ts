import { describe, expect, it } from "vitest";
import z from "zod";
import {
  LogoutResponseDto,
  LogoutResponseDtoType,
  LogoutSuccessResponseDto,
} from "./logout.dto";

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
    } satisfies LogoutResponseDtoType["success"]);

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe(200);
  });

  it("accepts a valid error response", () => {
    const input = {
      type: "error",
      message: "Unauthorized: Invalid session",
      status: 401,
      cause: null,
    } satisfies LogoutResponseDtoType["error"];

    const result = LogoutResponseDto.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe(401);
  });

  it("fails on unknown type", () => {
    const result = LogoutResponseDto.safeParse({
      type: "error",
      message: "Unauthorized: Invalid session",
      status: 204,
      cause: null,
    });

    expect(result.success).toBe(false);
  });
});
