import { describe, expect, it } from "vitest";
import { accessTokenExample } from "./common";
import {
  RefreshTokenResponseDto,
  RefreshTokenResponseDtoType,
  RefreshTokenSuccessResponseDto,
} from "./refresh-token.dto";

describe("RefreshTokenSuccessResponseDto", () => {
  it("validates a correct refresh token success response", () => {
    const input = {
      type: "success",
      status: 200,
      message: "Access token has been refreshed successfully.",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "john_doe",
          firstName: "john",
          lastName: "doe",
          email: "john@example.com",
          image: null,
          imageKey: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
        },
      },
    } satisfies RefreshTokenResponseDtoType["success"];

    const result = RefreshTokenSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.data.accessToken).toBe(accessTokenExample);
    expect(result.data?.data.user.email).toBe("john@example.com");
  });

  it("fails when user object is malformed", () => {
    const result = RefreshTokenSuccessResponseDto.safeParse({
      type: "success",
      status: 200,
      message: "Access token has been refreshed successfully.",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "john",
          // missing required fields like email / createdAt
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it("strips extra fields", () => {
    const input = {
      type: "success",
      status: 200,
      message: "Access token has been refreshed successfully.",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "john_doe",
          firstName: "john",
          lastName: "doe",
          email: "john@example.com",
          image: null,
          imageKey: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
          extraUserField: "REMOVE_ME",
        },
        extraField: "REMOVE_ME",
      },
      extraTopLevel: "REMOVE_ME",
    };

    const result = RefreshTokenSuccessResponseDto.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("extraTopLevel");
    expect(result.data?.data).not.toHaveProperty("extraField");
    expect(result.data?.data.user).not.toHaveProperty("extraUserField");
  });
});

describe("RefreshTokenResponseDto (union)", () => {
  it("accepts the success variant", () => {
    const result = RefreshTokenResponseDto.safeParse({
      type: "success",
      status: 200,
      message: "Access token has been refreshed successfully.",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "john",
          firstName: "john",
          lastName: "doe",
          email: "john@example.com",
          image: null,
          imageKey: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
        },
      },
    } satisfies RefreshTokenResponseDtoType["success"]);

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe(200);
  });

  it("accepts the error variant", () => {
    const result = RefreshTokenResponseDto.safeParse({
      type: "error",
      status: 401,
      message: "Unauthorized: Invalid session, or missing refresh token",
      cause: null,
    } satisfies RefreshTokenResponseDtoType["error"]);
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe(401);
  });

  it("fails on unknown status", () => {
    const result = RefreshTokenResponseDto.safeParse({
      type: "error",
      status: 204,
      message: "Unauthorized: Invalid session, or missing refresh token",
      cause: null,
    });

    expect(result.success).toBe(false);
  });
});
