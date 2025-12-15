import { describe, expect, it } from "vitest";

import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
  UpdateUserResponseDtoType,
  UpdateUserSuccessResponseDto,
  type UpdateUserRequestDtoType,
} from "./update-user.dto";

import { UPLOAD_THING_KEY_EXAMPLE, UPLOAD_THING_URL_EXAMPLE } from "./common";

describe("UpdateUserRequestDto", () => {
  it("accepts a valid partial update payload", () => {
    const payload: UpdateUserRequestDtoType = {
      firstName: "John",
      lastName: "Doe",
      bio: "Full-stack engineer",
      image: UPLOAD_THING_URL_EXAMPLE,
      imageKey: UPLOAD_THING_KEY_EXAMPLE,
      isPrivate: true,
    };

    const result = UpdateUserRequestDto.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe("John");
    }
  });

  it("allows empty object (all fields are optional)", () => {
    const result = UpdateUserRequestDto.safeParse({});
    console.log(result.error);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ isPrivate: false }); // by default, isPrivate:false in zod schema
    }
  });

  it("rejects invalid email if provided", () => {
    const result = UpdateUserRequestDto.safeParse({
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("rejects invalid field types", () => {
    const result = UpdateUserRequestDto.safeParse({
      isPrivate: "yes",
    });

    expect(result.success).toBe(false);
  });
});

describe("UpdateUserSuccessResponseDto", () => {
  it("accepts a valid success response", () => {
    const response = {
      status: 200,
      type: "success",
      message: "User info has been updated successfully",
      data: {
        name: "John_doe20",
        firstName: "john",
        lastName: "doe",
        email: "test@example.com",
        image: UPLOAD_THING_URL_EXAMPLE,
        imageKey: UPLOAD_THING_KEY_EXAMPLE,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } satisfies UpdateUserResponseDtoType["success"];

    const result = UpdateUserSuccessResponseDto.safeParse(response);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(200);
      expect(result.data.data.email).toBe("test@example.com");
    }
  });
});

describe("UpdateUserResponseDto (discriminated union)", () => {
  it("parses success variant", () => {
    const response = {
      status: 200,
      type: "success",
      message: "User info has been updated successfully",
      data: {
        name: "John_doe20",
        firstName: "john",
        lastName: "doe",
        email: "test@example.com",
        image: UPLOAD_THING_URL_EXAMPLE,
        imageKey: UPLOAD_THING_KEY_EXAMPLE,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } satisfies UpdateUserResponseDtoType["success"];

    const parsed = UpdateUserResponseDto.parse(response);

    expect(parsed.status).toBe(200);
  });

  it("parses bad request error variant", () => {
    const response = {
      type: "error",
      status: 400,
      message: "Invalid request body",
      cause: {
        path: ["email"],
        message: "Invalid email",
      },
    } satisfies UpdateUserResponseDtoType["error"];

    const parsed = UpdateUserResponseDto.safeParse(response);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe(400);
    }
  });

  it("rejects unknown discriminant", () => {
    const result = UpdateUserResponseDto.safeParse({
      status: 204,
    });

    expect(result.success).toBe(false);
  });
});
