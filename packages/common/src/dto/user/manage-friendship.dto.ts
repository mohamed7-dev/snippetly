import {
  BadRequestErrorResponseDto,
  BadRequestErrorResponseDtoType,
  createSuccessResponse,
  RateLimiterErrorResponseDto,
  RateLimiterErrorResponseDtoType,
  SharedErrorResDto,
  SharedErrorResDtoType,
  UnauthorizedErrorResponseDto,
  UnAuthorizedErrorResponseDtoType,
  z,
} from "../zod";
import { CommonFriendshipResDto } from "./common";
import { SelectUserDto } from "./select-user.dto";

// Manage Friendship Request
const ManageFriendshipRequestParam = z.object({
  friend_name: SelectUserDto.shape.name,
});
export const ManageFriendshipRequestParamDto =
  ManageFriendshipRequestParam.meta({
    id: "ManageFriendshipRequestParam",
    description: "Manage friendship request param",
    example: {
      friend_name: "john_doe7",
    } satisfies z.infer<typeof ManageFriendshipRequestParam>,
  });

export type ManageFriendshipRequestParamDtoType = z.infer<
  typeof ManageFriendshipRequestParamDto
>;

// Send Friendship Response

const SendRequestSuccessRes = CommonFriendshipResDto.omit({
  rejectedAt: true,
  acceptedAt: true,
  cancelledAt: true,
});

export const SendFriendshipRequestSuccessResDto = createSuccessResponse(
  SendRequestSuccessRes,
  "SendRequestSuccessResBody",
  "Send friendship request success response body",
  {
    createdAt: new Date().toISOString() as unknown as Date,
    requesterId: 5,
    addresseeId: 10,
    status: "pending",
  } satisfies z.infer<typeof SendRequestSuccessRes>,
  "Friendship request has been sent successfully"
);

export const SendFriendshipRequestResDto = z.discriminatedUnion("status", [
  SendFriendshipRequestSuccessResDto,
  ...SharedErrorResDto,
  UnauthorizedErrorResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
]);

export type SendFriendshipRequestResDtoType = {
  success: z.infer<typeof SendFriendshipRequestSuccessResDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | BadRequestErrorResponseDtoType<ManageFriendshipRequestParamDtoType>
    | RateLimiterErrorResponseDtoType;
};

// Accept Friendship Response

const AcceptFriendshipRequestSuccessRes = CommonFriendshipResDto.omit({
  rejectedAt: true,
  cancelledAt: true,
});

export const AcceptFriendshipRequestSuccessResDto = createSuccessResponse(
  AcceptFriendshipRequestSuccessRes,
  "AcceptFriendshipRequestSuccessResBody",
  "Accept friendship request success response body",
  {
    createdAt: new Date().toISOString() as unknown as Date,
    requesterId: 5,
    addresseeId: 10,
    status: "accepted",
    acceptedAt: new Date().toISOString() as unknown as Date,
  } satisfies z.infer<typeof AcceptFriendshipRequestSuccessRes>,
  "Friendship request has been accepted successfully"
);

export const AcceptFriendshipRequestResDto = z.discriminatedUnion("status", [
  AcceptFriendshipRequestSuccessResDto,
  ...SharedErrorResDto,
  UnauthorizedErrorResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
]);

export type AcceptFriendshipRequestResDtoType = {
  success: z.infer<typeof AcceptFriendshipRequestSuccessResDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | BadRequestErrorResponseDtoType<ManageFriendshipRequestParamDtoType>
    | RateLimiterErrorResponseDtoType;
};

// Reject Friendship Response
const RejectFriendshipRequestSuccessRes = CommonFriendshipResDto.omit({
  acceptedAt: true,
  cancelledAt: true,
});

export const RejectFriendshipRequestSuccessResDto = createSuccessResponse(
  RejectFriendshipRequestSuccessRes,
  "RejectFriendshipRequestSuccessResBody",
  "Reject friendship request success response body",
  {
    createdAt: new Date().toISOString() as unknown as Date,
    requesterId: 5,
    addresseeId: 10,
    status: "rejected",
    rejectedAt: new Date().toISOString() as unknown as Date,
  } satisfies z.infer<typeof RejectFriendshipRequestSuccessRes>,
  "Friendship request has been rejected successfully"
);

export const RejectFriendshipRequestResDto = z.discriminatedUnion("status", [
  RejectFriendshipRequestSuccessResDto,
  ...SharedErrorResDto,
  UnauthorizedErrorResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
]);

export type RejectFriendshipRequestResDtoType = {
  success: z.infer<typeof RejectFriendshipRequestSuccessResDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | BadRequestErrorResponseDtoType<ManageFriendshipRequestParamDtoType>
    | RateLimiterErrorResponseDtoType;
};

// Cancel Friendship Response

const CancelFriendshipRequestSuccessRes = CommonFriendshipResDto.omit({
  rejectedAt: true,
  acceptedAt: true,
});

export const CancelFriendshipRequestSuccessResDto = createSuccessResponse(
  CancelFriendshipRequestSuccessRes,
  "CancelFriendshipRequestSuccessResBody",
  "Cancel friendship request success response body",
  {
    createdAt: new Date().toISOString() as unknown as Date,
    requesterId: 5,
    addresseeId: 10,
    status: "pending",
    cancelledAt: new Date().toISOString() as unknown as Date,
  } satisfies z.infer<typeof CancelFriendshipRequestSuccessRes>,
  "Friendship request has been cancelled successfully"
);

export const CancelFriendshipRequestResDto = z.discriminatedUnion("status", [
  CancelFriendshipRequestSuccessResDto,
  ...SharedErrorResDto,
  UnauthorizedErrorResponseDto,
  BadRequestErrorResponseDto,
  RateLimiterErrorResponseDto,
]);

export type CancelFriendshipRequestResDtoType = {
  success: z.infer<typeof CancelFriendshipRequestSuccessResDto>;
  error:
    | SharedErrorResDtoType
    | UnAuthorizedErrorResponseDtoType
    | BadRequestErrorResponseDtoType<ManageFriendshipRequestParamDtoType>
    | RateLimiterErrorResponseDtoType;
};
