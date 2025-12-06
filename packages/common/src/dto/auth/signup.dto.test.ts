import { describe, it, expect } from "vitest";
import {
  SignupRequestDto,
  SignupConflictResponseDto,
  SignupSuccessResponseDto,
  SignupResponseDto,
} from "./signup.dto";
import { GlobalErrorResponseDto, z } from "../zod";
import { accessTokenExample } from "./common";

describe("SignupRequestDto", () => {
  it("validates a correct signup request", () => {
    const input = {
      name: "john_doe20",
      password: "Password@12345678",
      email: "test@example.com",
      acceptedPolicies: true,
      isPrivate: false,
    } satisfies z.infer<typeof SignupRequestDto>;

    const result = SignupRequestDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(input);
  });

  it("strips extra fields", () => {
    const input = {
      name: "john_doe20",
      password: "Password@12345678",
      email: "test@example.com",
      acceptedPolicies: true,
      isPrivate: false,
      extraField: "shouldRemove",
    } satisfies z.infer<typeof SignupRequestDto> & {
      extraField: string;
    };

    const result = SignupRequestDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("extraField");
  });

  it("fails on missing required fields", () => {
    const result = SignupRequestDto.safeParse({
      name: "john_doe20",
      // missing password, email, acceptedPolicies
    });

    expect(result.success).toBe(false);
  });
});

describe("SignupConflictResponseDto", () => {
  it("validates correct conflict response", () => {
    const input = {
      type: "conflict",
      status: 409,
      message:
        "User account with the same name john_doe20 already exists, but you can use one of the generated names.",
      data: {
        suggestedNames: ["john_doe20-2", "john_doe20-3"],
      },
    } satisfies z.infer<typeof SignupConflictResponseDto>;

    const result = SignupConflictResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.data.suggestedNames.length).toBe(2);
  });

  it("fails when suggestedNames is not an array", () => {
    const result = SignupConflictResponseDto.safeParse({
      type: "conflict",
      message: "Conflict",
      data: {
        suggestedNames: "wrong",
      },
    });

    expect(result.success).toBe(false);
  });
});

describe("SignupSuccessResponseDto", () => {
  it("validates a correct signup success response", () => {
    const input = {
      type: "success",
      status: 201,
      message: "User account has been created successfully.",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "john_doe20",
          firstName: null,
          lastName: null,
          email: "test@example.com",
          image: null,
          imageKey: null,
          imageCustomId: null,
          createdAt: new Date(),
          isPrivate: false,
        },
      },
    } satisfies z.infer<typeof SignupSuccessResponseDto>;

    const result = SignupSuccessResponseDto.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.data.user.email).toBe("test@example.com");
  });

  it("fails when required user fields are missing", () => {
    const result = SignupSuccessResponseDto.safeParse({
      type: "success",
      status: 201,
      message: "User account has been created successfully.",
      data: {
        accessToken: accessTokenExample,
        user: {
          // missing required fields like name, email
        },
      },
    });

    expect(result.success).toBe(false);
  });

  it("strips extra fields", () => {
    const result = SignupSuccessResponseDto.safeParse({
      type: "success",
      status: 201,
      message: "User account has been created successfully.",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "john_doe20",
          firstName: null,
          lastName: null,
          email: "test@example.com",
          image: null,
          imageKey: null,
          imageCustomId: null,
          createdAt: new Date(),
          isPrivate: false,
          extraField: "strip this",
        },
      },
    });
    expect(result.success).toBe(true);
    expect(result.data?.data).not.toHaveProperty("extraField");
  });
});

describe("SignupResponseDto (union)", () => {
  it("accepts signup success response", () => {
    const result = SignupResponseDto.safeParse({
      type: "success",
      status: 201,
      message: "User account has been created successfully.",
      data: {
        accessToken: accessTokenExample,
        user: {
          name: "john",
          firstName: null,
          lastName: null,
          email: "john@example.com",
          image: null,
          imageKey: null,
          imageCustomId: null,
          createdAt: new Date(),
          isPrivate: false,
        },
      },
    } satisfies z.infer<typeof SignupSuccessResponseDto>);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("success");
  });

  it("accepts signup conflict response", () => {
    const result = SignupResponseDto.safeParse({
      type: "conflict",
      status: 409,
      message: "Conflict",
      data: {
        suggestedNames: ["a", "b"],
      },
    } satisfies z.infer<typeof SignupConflictResponseDto>);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("conflict");
  });

  it("accepts global error response", () => {
    const result = SignupResponseDto.safeParse({
      type: "error",
      message: "Something went wrong",
      status: 500,
      cause: null,
    } satisfies z.infer<typeof GlobalErrorResponseDto>);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe("error");
  });

  it("fails when type does not match any variant", () => {
    const result = SignupResponseDto.safeParse({
      type: "weird",
      message: "???",
    });

    expect(result.success).toBe(false);
  });
});
