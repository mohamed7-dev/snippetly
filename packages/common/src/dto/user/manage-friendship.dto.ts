import { createSuccessResponse, GlobalErrorResponseDto, z } from "../zod";
import { CommonFriendshipResDto } from "./common";
import { SelectUserDto } from "./select-user.dto";

// Manage Friendship Request
export const ManageFriendshipRequestParamDto = z
  .object({
    friend_name: SelectUserDto.shape.name,
  })
  .meta({
    id: "ManageFriendshipRequestParam",
    description: "Manage friendship request param",
    example: {
      friend_name: "john_doe98",
    },
  });

export type ManageFriendshipRequestParamDtoType = z.infer<
  typeof ManageFriendshipRequestParamDto
>;

// Send Friendship Response

export const SendRequestSuccessRes = CommonFriendshipResDto.omit({
  rejectedAt: true,
  acceptedAt: true,
  cancelledAt: true,
});

export const SendFriendshipRequestSuccessResDto = createSuccessResponse(
  SendRequestSuccessRes,
  "SendRequestSuccessResBody",
  "Send friendship request success response body",
  {
    createdAt: new Date().toISOString(),
    requesterId: 5,
    addresseeId: 10,
    status: "pending",
  },
  "Friendship request has been sent successfully"
);

export const SendFriendshipRequestResDto = z.discriminatedUnion("type", [
  SendFriendshipRequestSuccessResDto,
  GlobalErrorResponseDto,
]);

export type SendFriendshipRequestResDtoType = z.infer<
  typeof SendFriendshipRequestResDto
>;

// Accept Friendship Response

export const AcceptFriendshipRequestSuccessRes = CommonFriendshipResDto.omit({
  rejectedAt: true,
  cancelledAt: true,
});

export const AcceptFriendshipRequestSuccessResDto = createSuccessResponse(
  AcceptFriendshipRequestSuccessRes,
  "AcceptFriendshipRequestSuccessResBody",
  "Accept friendship request success response body",
  {
    createdAt: new Date().toISOString(),
    requesterId: 5,
    addresseeId: 10,
    status: "pending",
    acceptedAt: new Date().toISOString(),
  },
  "Friendship request has been accepted successfully"
);

export const AcceptFriendshipRequestResDto = z.discriminatedUnion("type", [
  AcceptFriendshipRequestSuccessResDto,
  GlobalErrorResponseDto,
]);

export type AcceptFriendshipRequestResDtoType = z.infer<
  typeof AcceptFriendshipRequestResDto
>;

// Reject Friendship Response
export const RejectFriendshipRequestSuccessRes = CommonFriendshipResDto.omit({
  acceptedAt: true,
  cancelledAt: true,
});

export const RejectFriendshipRequestSuccessResDto = createSuccessResponse(
  RejectFriendshipRequestSuccessRes,
  "RejectFriendshipRequestSuccessResBody",
  "Reject friendship request success response body",
  {
    createdAt: new Date().toISOString(),
    requesterId: 5,
    addresseeId: 10,
    status: "pending",
    rejectedAt: new Date().toISOString(),
  },
  "Friendship request has been rejected successfully"
);

export const RejectFriendshipRequestResDto = z.discriminatedUnion("type", [
  RejectFriendshipRequestSuccessResDto,
  GlobalErrorResponseDto,
]);

export type RejectFriendshipRequestResDtoType = z.infer<
  typeof RejectFriendshipRequestResDto
>;

// Cancel Friendship Response

export const CancelFriendshipRequestSuccessRes = CommonFriendshipResDto.omit({
  rejectedAt: true,
  acceptedAt: true,
});

export const CancelFriendshipRequestSuccessResDto = createSuccessResponse(
  CancelFriendshipRequestSuccessRes,
  "CancelFriendshipRequestSuccessResBody",
  "Cancel friendship request success response body",
  {
    createdAt: new Date().toISOString(),
    requesterId: 5,
    addresseeId: 10,
    status: "pending",
    cancelledAt: new Date().toISOString(),
  },
  "Friendship request has been cancelled successfully"
);

export const CancelFriendshipRequestResDto = z.discriminatedUnion("type", [
  CancelFriendshipRequestSuccessResDto,
  GlobalErrorResponseDto,
]);

export type CancelFriendshipRequestResDtoType = z.infer<
  typeof CancelFriendshipRequestResDto
>;
