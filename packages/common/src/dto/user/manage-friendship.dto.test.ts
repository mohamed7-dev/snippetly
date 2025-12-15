import { describe, expect, it } from "vitest";
import {
  AcceptFriendshipRequestSuccessResDto,
  CancelFriendshipRequestSuccessResDto,
  ManageFriendshipRequestParamDto,
  type ManageFriendshipRequestParamDtoType,
  RejectFriendshipRequestSuccessResDto,
  SendFriendshipRequestResDto,
  SendFriendshipRequestResDtoType,
  SendFriendshipRequestSuccessResDto,
} from "./manage-friendship.dto";

describe("ManageFriendshipRequestParamDto", () => {
  it("parses a valid friend_name param", () => {
    const result = ManageFriendshipRequestParamDto.safeParse({
      friend_name: "john_doe7",
    } satisfies ManageFriendshipRequestParamDtoType);

    expect(result.data?.friend_name).toBe("john_doe7");
    expect(result.success).toBe(true);
  });

  it("strips extra params", () => {
    const result = ManageFriendshipRequestParamDto.safeParse({
      friend_name: "john_doe7",
      extra: "remove-me",
    });

    expect(result.data).toEqual({ friend_name: "john_doe7" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid friend_name", () => {
    expect(() =>
      ManageFriendshipRequestParamDto.parse({
        friend_name: "",
      })
    ).toThrow();
  });
});

describe("SendFriendshipRequestResDto", () => {
  it("parses success response and strips forbidden fields", () => {
    const response = {
      status: 200,
      type: "success",
      message: "Friendship request has been sent successfully",
      data: {
        createdAt: new Date(),
        requesterId: 5,
        addresseeId: 10,
        status: "pending",
        extra: "remove-me",
      },
      extraTopLevel: "remove-me",
    };

    const parsed = SendFriendshipRequestSuccessResDto.safeParse(response);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.data.status).toEqual("pending");
    expect(parsed.data).not.toHaveProperty("extraTopLevel");
    expect(parsed.data?.data).not.toHaveProperty("extra");
  });

  it("accepts error variant", () => {
    const parsed = SendFriendshipRequestResDto.safeParse({
      status: 400,
      type: "error",
      message: "Invalid friend name",
      cause: [
        {
          path: ["friend_name"],
          message: "Invalid value",
        },
      ],
    } satisfies SendFriendshipRequestResDtoType["error"]);

    expect(parsed.success).toBe(true);
  });
});

describe("AcceptFriendshipRequestResDto", () => {
  it("parses success response and strips forbidden fields", () => {
    const response = {
      status: 200,
      type: "success",
      message: "Friendship request has been accepted successfully",
      data: {
        createdAt: new Date(),
        requesterId: 5,
        addresseeId: 10,
        status: "accepted",
        acceptedAt: new Date(),
        rejectedAt: new Date(),
      },
    };

    const parsed = AcceptFriendshipRequestSuccessResDto.safeParse(response);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.data.status).toEqual("accepted");
    expect(parsed.data?.data).not.toHaveProperty("rejectedAt");
  });
});

describe("RejectFriendshipRequestResDto", () => {
  it("parses success response and strips forbidden fields", () => {
    const response = {
      status: 200,
      type: "success",
      message: "Friendship request has been rejected successfully",
      data: {
        createdAt: new Date(),
        requesterId: 5,
        addresseeId: 10,
        status: "rejected",
        rejectedAt: new Date(),
        cancelledAt: new Date(),
        acceptedAt: new Date(),
      },
    };

    const parsed = RejectFriendshipRequestSuccessResDto.safeParse(response);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.data.status).toEqual("rejected");
    expect(parsed.data?.data).not.toHaveProperty("cancelledAt");
    expect(parsed.data?.data).not.toHaveProperty("acceptedAt");
  });
});

describe("CancelFriendshipRequestResDto", () => {
  it("parses success response and strips forbidden fields", () => {
    const response = {
      status: 200,
      type: "success",
      message: "Friendship request has been cancelled successfully",
      data: {
        createdAt: new Date(),
        requesterId: 5,
        addresseeId: 10,
        status: "pending",
        cancelledAt: new Date(),
        acceptedAt: new Date(),
        rejectedAt: new Date(),
      },
    };

    const parsed = CancelFriendshipRequestSuccessResDto.safeParse(response);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.data.status).toEqual("pending");
    expect(parsed.data?.data).not.toHaveProperty("rejectedAt");
    expect(parsed.data?.data).not.toHaveProperty("acceptedAt");
  });
});
