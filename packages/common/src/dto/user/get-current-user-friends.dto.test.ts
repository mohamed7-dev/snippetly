import { describe, expect, it } from "vitest";
import { GetCurrentUserFriendsRequestQueryDtoType } from "../../../lib";
import { z } from "../zod";
import {
  GetCurrentUserFriendsRequestQueryDto,
  GetCurrentUserFriendsResDto,
  GetCurrentUserFriendsSuccessResDto,
  GetCurrentUserInboxSuccessResDto,
  GetCurrentUserOutboxSuccessResDto,
} from "./get-current-user-friends.dto";

describe("GetCurrentUserFriendsRequestQueryDto", () => {
  it("parses valid query", () => {
    const result = GetCurrentUserFriendsRequestQueryDto.safeParse({
      limit: 20,
      cursor: { id: 100 },
      query: "john | doe",
    } satisfies GetCurrentUserFriendsRequestQueryDtoType);

    expect(result.success).toBe(true);
  });

  it("allows empty query object", () => {
    const result = GetCurrentUserFriendsRequestQueryDto.parse({});

    expect(result).toEqual({});
  });

  it("rejects invalid limit", () => {
    expect(() =>
      GetCurrentUserFriendsRequestQueryDto.parse({
        limit: 0,
      })
    ).toThrow();

    expect(() =>
      GetCurrentUserFriendsRequestQueryDto.parse({
        limit: 101,
      })
    ).toThrow();
  });

  it("rejects empty search query", () => {
    expect(() =>
      GetCurrentUserFriendsRequestQueryDto.parse({
        query: "",
      })
    ).toThrow();
  });
});

describe("GetCurrentUserFriendsSuccessResDto", () => {
  it("parses valid friends success response", () => {
    const result = GetCurrentUserFriendsSuccessResDto.parse({
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        total: 1,
        nextCursor: undefined,
        items: [
          {
            firstName: "john",
            lastName: "doe",
            name: "john_doe",
            image: "https://img.test",
            bio: "developer",
            requestSentAt: new Date(),
            requestAcceptedAt: new Date(),
            requestStatus: "accepted",
            snippetsCount: 5,
            recentSnippets: [
              {
                title: "Zod Tips",
                slug: "zod-tips",
                language: "typescript",
                createdAt: new Date(),
              },
            ],
          },
        ],
      },
    } satisfies z.infer<typeof GetCurrentUserFriendsSuccessResDto>);

    expect(result.status).toBe(200);
    expect(result.data.items[0].recentSnippets.length).toBe(1);
  });

  it("rejects missing acceptedAt for friends", () => {
    expect(() =>
      GetCurrentUserFriendsSuccessResDto.parse({
        status: 200,
        type: "success",
        message: "Fetched",
        data: {
          total: 1,
          items: [
            {
              firstName: "john",
              lastName: "doe",
              name: "john_doe",
              image: "https://img.test",
              bio: "developer",
              requestSentAt: new Date(),
              requestStatus: "accepted",
              snippetsCount: 5,
              recentSnippets: [],
            },
          ],
        },
      })
    ).toThrow();
  });
});

describe("Inbox DTO", () => {
  it("parses inbox success response", () => {
    const result = GetCurrentUserInboxSuccessResDto.parse({
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        total: 2,
        nextCursor: { id: 22 },
        items: [
          {
            firstName: "omar",
            lastName: "ali",
            name: "omar_ali",
            image: "https://img.test",
            bio: "analyst",
            requestSentAt: new Date(),
            requestStatus: "pending",
            snippetsCount: 3,
          },
        ],
      },
    } satisfies z.infer<typeof GetCurrentUserInboxSuccessResDto>);

    expect(result.data.items[0].requestStatus).toBe("pending");
    expect(result.data.items[0]).not.toHaveProperty("recentSnippets");
  });

  it("rejects inbox item with recentSnippets", () => {
    expect(() =>
      GetCurrentUserInboxSuccessResDto.parse({
        success: 200,
        type: "success",
        message: "Fetched",
        data: {
          total: 1,
          items: [
            {
              firstName: "omar",
              lastName: "ali",
              name: "omar",
              image: "https://img.test",
              bio: "analyst",
              requestSentAt: new Date(),
              requestStatus: "pending",
              snippetsCount: 3,
              recentSnippets: [],
            },
          ],
        },
      })
    ).toThrow();
  });
});

describe("Outbox DTO", () => {
  it("parses outbox success response", () => {
    const result = GetCurrentUserOutboxSuccessResDto.parse({
      status: 200,
      type: "success",
      message: "Fetched successfully",
      data: {
        total: 1,
        nextCursor: undefined,
        items: [
          {
            firstName: "jenna",
            lastName: "smith",
            name: "jenna",
            image: "https://img.test",
            bio: "engineer",
            requestSentAt: new Date(),
            requestStatus: "rejected",
            snippetsCount: 1,
          },
        ],
      },
    } satisfies z.infer<typeof GetCurrentUserInboxSuccessResDto>);

    expect(result.data.items[0].requestStatus).toBe("rejected");
  });
});

describe("Discriminated unions", () => {
  it("accepts success variant", () => {
    const res = GetCurrentUserFriendsResDto.parse({
      status: 200,
      type: "success",
      message: "Fetched",
      data: {
        total: 0,
        items: [],
        nextCursor: undefined,
      },
    });

    expect(res.status).toBe(200);
  });

  it("accepts unauthorized error", () => {
    const res = GetCurrentUserFriendsResDto.parse({
      type: "error",
      status: 401,
      message: "Unauthorized",
      cause: null,
    });

    expect(res.status).toBe(401);
  });

  it("rejects unknown status", () => {
    expect(() =>
      GetCurrentUserFriendsResDto.parse({
        status: 204,
      })
    ).toThrow();
  });
});
