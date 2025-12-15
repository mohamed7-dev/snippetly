import { describe, expect, it } from "vitest";
import { UPLOAD_THING_KEY_EXAMPLE, UPLOAD_THING_URL_EXAMPLE } from "./common";
import {
  DiscoverUsersRequestQueryDto,
  DiscoverUsersResponseDto,
  DiscoverUsersResponseDtoType,
  DiscoverUsersSuccessResponseDto,
} from "./discover-users.dto";

describe("DiscoverUsersRequestQueryDto", () => {
  it("parses a valid query", () => {
    const query = {
      limit: 10,
      cursor: { snippetsCount: 50, id: 8 },
      query: "john",
    };

    const result = DiscoverUsersRequestQueryDto.parse(query);

    expect(result.limit).toBe(10);
    expect(result.cursor).toEqual({
      snippetsCount: 50,
      id: 8,
    });
    expect(result.query).toBe("john");
  });

  it("allows empty query params", () => {
    const result = DiscoverUsersRequestQueryDto.safeParse({});

    expect(result.data).toEqual({});
    expect(result.success).toEqual(true);
  });

  it("rejects invalid limit", () => {
    expect(() => DiscoverUsersRequestQueryDto.parse({ limit: 0 })).toThrow();
  });

  it("rejects invalid cursor", () => {
    expect(() =>
      DiscoverUsersRequestQueryDto.parse({
        cursor: { id: 8 },
      })
    ).toThrow();
  });

  it("strips unknown query params", () => {
    const result = DiscoverUsersRequestQueryDto.safeParse({
      limit: 10,
      unknown: "remove-me",
    });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("unknown");
  });
});

describe("DiscoverUsersSuccessResponseDto", () => {
  it("parses a valid success response", () => {
    const response = {
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        items: [
          {
            name: "John_doe7",
            firstName: "john",
            lastName: "doe",
            image: UPLOAD_THING_URL_EXAMPLE,
            imageKey: UPLOAD_THING_KEY_EXAMPLE,
            bio: "I'm a full-stack developer",
            email: "test@example.com",
            createdAt: new Date(),
            friendsCount: 10,
            snippetsCount: 100,
            tags: [{ name: "react-hooks" }],
          },
        ],
        total: 50,
        nextCursor: {
          snippetsCount: 41,
          id: 98,
        },
      },
    } satisfies DiscoverUsersResponseDtoType["success"];

    const result = DiscoverUsersSuccessResponseDto.safeParse(response);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.items[0].friendsCount).toBe(10);
      expect(result.data.data.items[0].tags[0].name).toBe("react-hooks");
    }
  });

  it("strips extra fields from items and response body", () => {
    const response = {
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        items: [
          {
            name: "John_doe7",
            firstName: "john",
            lastName: "doe",
            image: UPLOAD_THING_URL_EXAMPLE,
            imageKey: UPLOAD_THING_KEY_EXAMPLE,
            bio: "I'm a full-stack developer",
            email: "test@example.com",
            createdAt: new Date(),
            friendsCount: 10,
            snippetsCount: 100,
            tags: [{ name: "react-hooks", extra: "remove-me" }],
            extraUserField: "remove-me",
          },
        ],
        total: 50,
        nextCursor: {
          snippetsCount: 41,
          id: 98,
          extra: "remove-me",
        },
        extraBodyField: "remove-me",
      },
      extraTopLevel: "remove-me",
    };

    const parsed = DiscoverUsersSuccessResponseDto.safeParse(response);
    expect(parsed.success).toBe(true);
    expect(parsed.data).not.toHaveProperty("extraTopLevel");
    expect(parsed.data?.data).not.toHaveProperty("extraBodyField");
    expect(parsed.data?.data.nextCursor).not.toHaveProperty("extra");
    expect(parsed.data?.data.items?.[0]).not.toHaveProperty("extraUserField");
    expect(parsed.data?.data.items?.[0]?.tags[0]).not.toHaveProperty("extra");
  });
});

describe("DiscoverUsersResponseDto (discriminated union)", () => {
  it("accepts success variant", () => {
    const parsed = DiscoverUsersResponseDto.safeParse({
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        items: [],
        total: 0,
        nextCursor: undefined,
      },
    } satisfies DiscoverUsersResponseDtoType["success"]);

    expect(parsed.success).toBe(true);
  });

  it("accepts bad request error variant", () => {
    const parsed = DiscoverUsersResponseDto.safeParse({
      status: 400,
      type: "error",
      message: "Invalid query",
      cause: [
        {
          path: ["limit"],
          message: "Too small",
        },
      ],
    } satisfies DiscoverUsersResponseDtoType["error"]);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toEqual(400);
    }
  });

  it("rejects unknown discriminant", () => {
    const result = DiscoverUsersResponseDto.safeParse({
      status: 204,
    });

    expect(result.success).toBe(false);
  });
});
