import { describe, expect, it } from "vitest";

import {
  DeleteUserResponseDto,
  DeleteUserSuccessResponseDto,
  type DeleteUserResponseDtoType,
} from "./delete-user.dto";

describe("DeleteUserSuccessResponseDto", () => {
  it("parses a valid success response", () => {
    const response = {
      status: 200,
      type: "success",
      message: "User account has been deleted successfully",
      data: null,
    } satisfies DeleteUserResponseDtoType["success"];

    const result = DeleteUserSuccessResponseDto.safeParse(response);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(200);
      expect(result.data.data).toBeNull();
    }
  });

  it("strips extra fields from success response", () => {
    const response = {
      status: 200,
      type: "success",
      message: "User account has been deleted successfully",
      data: null,
      extraField: "should-be-removed",
      anotherOne: 123,
    } satisfies DeleteUserResponseDtoType["success"] & Record<string, unknown>;

    const result = DeleteUserSuccessResponseDto.safeParse(response);

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("anotherOne");
    expect(result.data).not.toHaveProperty("extraField");
  });

  it("rejects non-null data", () => {
    const result = DeleteUserSuccessResponseDto.safeParse({
      status: 200,
      type: "success",
      message: "User account has been deleted successfully",
      data: {},
    });

    expect(result.success).toBe(false);
  });
});

describe("DeleteUserResponseDto (discriminated union)", () => {
  it("accepts success variant", () => {
    const response = {
      status: 200,
      type: "success",
      message: "User account has been deleted successfully",
      data: null,
    } satisfies DeleteUserResponseDtoType["success"];

    const parsed = DeleteUserResponseDto.parse(response);

    expect(parsed.status).toBe(200);
  });

  it("accepts unauthorized error variant and strips extra fields", () => {
    const response = {
      status: 401,
      type: "error",
      message: "Unauthorized",
      cause: null,
      extra: "should-be-removed",
    } satisfies DeleteUserResponseDtoType["error"] & Record<string, unknown>;

    const parsed = DeleteUserResponseDto.safeParse(response);

    expect(parsed.success).toBe(true);
    expect(parsed.data).not.toHaveProperty("extra");
  });

  it("accepts rate limiter error variant and strips extra fields", () => {
    const response = {
      status: 429,
      type: "error",
      message: "Too many requests",
      extra: "nope",
      cause: null,
    } satisfies DeleteUserResponseDtoType["error"] & Record<string, unknown>;

    const parsed = DeleteUserResponseDto.safeParse(response);

    expect(parsed.success).toBe(true);
    expect(parsed.data).not.toHaveProperty("extra");
  });

  it("rejects unknown discriminant", () => {
    const result = DeleteUserResponseDto.safeParse({
      status: 204,
    });

    expect(result.success).toBe(false);
  });
});
