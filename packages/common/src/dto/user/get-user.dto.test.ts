import { describe, expect, it } from "vitest";
import { z } from "../zod";
import {
  UPLOAD_THING_KEY_EXAMPLE,
  UPLOAD_THING_URL_EXAMPLE,
  UserActivityExample,
} from "./common";
import {
  GetCurrentUserDashboardSuccessResDto,
  GetCurrentUserResponseDto,
  GetCurrentUserResponseDtoType,
  GetPublicUserSuccessResponseBody,
  GetPublicUserSuccessResponseDto,
  GetUserRequestDto,
  GetUserResponseDto,
  GetUserSuccessResponseBody,
  GetUserSuccessResponseDto,
  type GetUserRequestDtoType,
} from "./get-user.dto";

describe("GetUserRequestDto", () => {
  it("parses valid request params", () => {
    const result = GetUserRequestDto.safeParse({
      name: "john_doe7",
    } satisfies GetUserRequestDtoType);

    expect(result.data).toEqual({ name: "john_doe7" });
  });

  it("strips extra params", () => {
    const result = GetUserRequestDto.safeParse({
      name: "john_doe7",
      role: "admin",
    });

    expect(result.data).toEqual({ name: "john_doe7" });
    expect(result.data).not.toHaveProperty("role");
  });

  it("rejects invalid name", () => {
    expect(() => GetUserRequestDto.parse({ name: "" })).toThrow();
  });
});

describe("GetUserSuccessResponseDto (owner)", () => {
  it("parses owner success response", () => {
    const response = {
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        profile: {
          name: "john_doe7",
          firstName: "john",
          lastName: "doe",
          image: UPLOAD_THING_URL_EXAMPLE,
          imageKey: UPLOAD_THING_KEY_EXAMPLE,
          bio: "I'm a full-stack developer",
          email: "test@example.com",
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
        },
        stats: UserActivityExample,
      },
    } satisfies z.infer<typeof GetUserSuccessResponseDto>;

    const parsed = GetUserSuccessResponseDto.safeParse(response);
    expect(parsed.success).toBe(true);
  });

  it("strips extra fields from owner profile", () => {
    const parsed = GetUserSuccessResponseDto.safeParse({
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        profile: {
          name: "john_doe7",
          firstName: "john",
          lastName: "doe",
          image: UPLOAD_THING_URL_EXAMPLE,
          imageKey: UPLOAD_THING_KEY_EXAMPLE,
          bio: "I'm a full-stack developer",
          email: "test@example.com",
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
          role: "admin",
        },
        stats: UserActivityExample,
        extra: "remove-me",
      },
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.data).not.toHaveProperty("extra");
    expect(parsed.data?.data?.profile).not.toHaveProperty("role");
  });
});

describe("GetPublicUserSuccessResponseDto (guest)", () => {
  it("does NOT expose private fields", () => {
    const parsed = GetPublicUserSuccessResponseDto.safeParse({
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        profile: {
          name: "john_doe7",
          firstName: "john",
          lastName: "doe",
          image: UPLOAD_THING_URL_EXAMPLE,
          imageKey: UPLOAD_THING_KEY_EXAMPLE,
          bio: "I'm a full-stack developer",
          email: "test@example.com",
          createdAt: new Date(),
        },
        friendshipInfo: {
          isCurrentUserAFriend: false,
        },
        stats: UserActivityExample,
      },
    } satisfies z.infer<typeof GetPublicUserSuccessResponseDto>);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.data?.profile).not.toHaveProperty("emailVerifiedAt");
    expect(parsed.data?.data?.profile).not.toHaveProperty("updatedAt");
    expect(parsed.data?.data?.profile).not.toHaveProperty("isPrivate");
  });
});

describe("GetUserResponseDto (type discriminated)", () => {
  it("parses owner-success variant", () => {
    const parsed = GetUserResponseDto.safeParse({
      type: "owner-success",
      status: 200,
      message: "Fetched successfully",
      data: {
        profile: {
          name: "john_doe7",
          firstName: "john",
          lastName: "doe",
          image: UPLOAD_THING_URL_EXAMPLE,
          imageKey: UPLOAD_THING_KEY_EXAMPLE,
          bio: "I'm a dev",
          email: "test@example.com",
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
        },
        stats: UserActivityExample,
      },
    } satisfies z.infer<typeof GetUserSuccessResponseBody>);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.type).toBe("owner-success");
  });

  it("parses public-success variant", () => {
    const parsed = GetUserResponseDto.safeParse({
      type: "public-success",
      status: 200,
      message: "Fetched successfully",
      data: {
        profile: {
          name: "john_doe7",
          firstName: "john",
          lastName: "doe",
          image: UPLOAD_THING_URL_EXAMPLE,
          imageKey: UPLOAD_THING_KEY_EXAMPLE,
          bio: "I'm a dev",
          email: "test@example.com",
          createdAt: new Date(),
        },
        friendshipInfo: {
          isCurrentUserAFriend: false,
        },
        stats: UserActivityExample,
      },
    } satisfies z.infer<typeof GetPublicUserSuccessResponseBody>);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.type).toBe("public-success");
  });
});

describe("GetCurrentUserResponseDto", () => {
  it("parses owner response via status discriminant", () => {
    const parsed = GetCurrentUserResponseDto.safeParse({
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        profile: {
          name: "john_doe7",
          firstName: "john",
          lastName: "doe",
          image: UPLOAD_THING_URL_EXAMPLE,
          imageKey: UPLOAD_THING_KEY_EXAMPLE,
          bio: "I'm a dev",
          email: "test@example.com",
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
        },
        stats: UserActivityExample,
      },
    } satisfies GetCurrentUserResponseDtoType["success"]);

    expect(parsed.success).toBe(true);
  });
});

describe("GetCurrentUserDashboardResDto", () => {
  it("parses dashboard success response and strips extras", () => {
    const parsed = GetCurrentUserDashboardSuccessResDto.safeParse({
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        user: {
          name: "john_doe20",
          firstName: "john",
          lastName: "doe",
          image: UPLOAD_THING_URL_EXAMPLE,
          imageKey: UPLOAD_THING_KEY_EXAMPLE,
          bio: "I'm a full-stack engineer",
          email: "test@example.com",
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: false,
          role: "admin",
        },
        collections: [
          {
            title: "React hooks",
            slug: "react-hooks",
            color: "#eee",
            createdAt: new Date(),
            updatedAt: new Date(),
            snippetsCount: 10,
            ownerId: 1,
          },
        ],
        stats: UserActivityExample,
        extra: "remove-me",
      },
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.data).not.toHaveProperty("extra");
    expect(parsed.data?.data.user).not.toHaveProperty("role");
    expect(parsed.data?.data.collections[0]).not.toHaveProperty("ownerId");
  });
});
