import { describe, expect, it } from "vitest";

import {
  ForgetPasswordDto,
  UpdateUserPasswordDto,
  type ForgetPasswordDtoType,
  type UpdateUserPasswordDtoType,
} from "./update-password.dto";

describe("UpdateUserPasswordDto", () => {
  it("parses a valid update password payload", () => {
    const payload = {
      currentPassword: "Str0ngP@ssw0rd!",
      newPassword: "An0therStr0ngP@ss!",
      email: "test@example.com",
    } satisfies UpdateUserPasswordDtoType;

    const result = UpdateUserPasswordDto.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("strips unknown fields", () => {
    const result = UpdateUserPasswordDto.safeParse({
      currentPassword: "Str0ngP@ssw0rd!",
      newPassword: "An0therStr0ngP@ss!",
      email: "test@example.com",
      role: "admin",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      currentPassword: "Str0ngP@ssw0rd!",
      newPassword: "An0therStr0ngP@ss!",
      email: "test@example.com",
    });
    expect(result.data).not.toHaveProperty("role");
  });

  it("rejects weak current password", () => {
    expect(() =>
      UpdateUserPasswordDto.parse({
        currentPassword: "123456",
        newPassword: "An0therStr0ngP@ss!",
        email: "test@example.com",
      })
    ).toThrow();
  });

  it("rejects weak new password", () => {
    expect(() =>
      UpdateUserPasswordDto.parse({
        currentPassword: "Str0ngP@ssw0rd!",
        newPassword: "password",
        email: "test@example.com",
      })
    ).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      UpdateUserPasswordDto.parse({
        currentPassword: "Str0ngP@ssw0rd!",
        newPassword: "An0therStr0ngP@ss!",
        email: "not-an-email",
      })
    ).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() =>
      UpdateUserPasswordDto.parse({
        newPassword: "An0therStr0ngP@ss!",
        email: "test@example.com",
      })
    ).toThrow();
  });
});

describe("ForgetPasswordDto", () => {
  it("parses valid payload without currentPassword", () => {
    const payload = {
      newPassword: "An0therStr0ngP@ss!",
      email: "test@example.com",
    } satisfies ForgetPasswordDtoType;

    const result = ForgetPasswordDto.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("parses valid payload with currentPassword", () => {
    const payload: ForgetPasswordDtoType = {
      currentPassword: "Str0ngP@ssw0rd!",
      newPassword: "An0therStr0ngP@ss!",
      email: "test@example.com",
    };

    const result = ForgetPasswordDto.safeParse(payload);

    expect(result.data?.currentPassword).toBe(payload.currentPassword);
  });

  it("strips unknown fields", () => {
    const result = ForgetPasswordDto.safeParse({
      newPassword: "An0therStr0ngP@ss!",
      email: "test@example.com",
      token: "reset-token",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      newPassword: "An0therStr0ngP@ss!",
      email: "test@example.com",
    });
    expect(result.data).not.toHaveProperty("token");
  });

  it("rejects weak new password", () => {
    expect(() =>
      ForgetPasswordDto.parse({
        newPassword: "password",
        email: "test@example.com",
      })
    ).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      ForgetPasswordDto.parse({
        newPassword: "An0therStr0ngP@ss!",
        email: "invalid-email",
      })
    ).toThrow();
  });
});
