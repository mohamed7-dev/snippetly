import { describe, expect, it } from "vitest";
import { CreateUserDto, type CreateUserDtoType } from "./create-user.dto";

describe("CreateUserDto", () => {
  it("parses a valid minimal payload", () => {
    const payload = {
      name: "john_doe7",
      email: "test@example.com",
      password: "Password@12345678",
      acceptedPolicies: true,
    } satisfies CreateUserDtoType;

    const result = CreateUserDto.safeParse(payload);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: "john_doe7",
      email: "test@example.com",
      password: "Password@12345678",
      acceptedPolicies: true,
      isPrivate: false, // zod adds this by default, which reflects db structure
    });
  });

  it("parses a full payload including optional fields", () => {
    const payload = {
      name: "john_doe7",
      email: "test@example.com",
      password: "Password@12345678",
      acceptedPolicies: true,
      isPrivate: false,
    } satisfies CreateUserDtoType;

    const result = CreateUserDto.safeParse(payload);

    expect(result.success).toBe(true);
    expect(result.data?.acceptedPolicies).toBe(true);
    expect(result.data?.isPrivate).toBe(false);
  });

  it("strips unknown fields", () => {
    const payload = {
      name: "john_doe7",
      email: "test@example.com",
      password: "Password@12345678",
      acceptedPolicies: false, // for some reason the client side decided to send the request without accepting policies
      role: "admin",
      createdAt: "2024-01-01",
    };

    const result = CreateUserDto.safeParse(payload);

    expect(result.success).toEqual(true);

    expect(result.data).not.toHaveProperty("role");
  });

  it("rejects missing required fields", () => {
    expect(() =>
      CreateUserDto.parse({
        email: "test@example.com",
        password: "Password@12345678",
      })
    ).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      CreateUserDto.parse({
        name: "john_doe7",
        email: "not-an-email",
        password: "Password@12345678",
      })
    ).toThrow();
  });

  it("rejects invalid field types", () => {
    expect(() =>
      CreateUserDto.parse({
        name: "john_doe7",
        email: "test@example.com",
        password: 123456,
      })
    ).toThrow();
  });
});
