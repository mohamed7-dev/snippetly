import z from "zod";
import { SelectFriendshipDto } from "./select-friendship.dto";
import { SelectUserDto } from "./select-user.dto";
import { SelectSnippetDto } from "../../snippet/dto/select-snippet.dto";

export const CommonDto = SelectFriendshipDto.omit({
  updatedAt: true,
  id: true,
});

// Send Request
export const SendRequestResDto = CommonDto.omit({
  rejectedAt: true,
  acceptedAt: true,
  cancelledAt: true,
}).transform((val) => {
  const { createdAt, status, ...rest } = val;
  return {
    ...rest,
    requestSentAt: createdAt,
    requestStatus: status,
  };
});

export type SendRequestResDtoType = z.infer<typeof SendRequestResDto>;

// Accept Request
export const AcceptRequestResDto = CommonDto.omit({
  rejectedAt: true,
  cancelledAt: true,
}).transform((val) => {
  const { createdAt, status, acceptedAt, ...rest } = val;
  return {
    ...rest,
    requestSentAt: createdAt,
    requestStatus: status,
    requestAcceptedAt: acceptedAt,
  };
});

export type AcceptRequestResDtoType = z.infer<typeof AcceptRequestResDto>;

// Reject Request
export const RejectRequestResDto = CommonDto.omit({
  acceptedAt: true,
  cancelledAt: true,
}).transform((val) => {
  const { createdAt, status, rejectedAt, ...rest } = val;
  return {
    ...rest,
    requestSentAt: createdAt,
    requestStatus: status,
    requestRejectedAt: rejectedAt,
  };
});

export type RejectRequestResDtoType = z.infer<typeof RejectRequestResDto>;

// Cancel Request
export const CancelRequestResDto = CommonDto.omit({
  rejectedAt: true,
  acceptedAt: true,
}).transform((val) => {
  const { createdAt, status, cancelledAt, ...rest } = val;
  return {
    ...rest,
    requestSentAt: createdAt,
    requestStatus: status,
    requestCancelledAt: cancelledAt,
  };
});

export type CancelRequestResDtoType = z.infer<typeof CancelRequestResDto>;

// ################# Common Friend ##################
const CommonFriendDto = SelectUserDto.pick({
  firstName: true,
  lastName: true,
  name: true,
  image: true,
  bio: true,
}).extend({
  requestSentAt: z.date(),
  requestStatus: SelectFriendshipDto.shape.status,
  snippetsCount: z.number(),
});

// Get User Friends
export const GetUserFriendsResDto = z.array(
  CommonFriendDto.extend({
    requestAcceptedAt: z.date(),
    recentSnippets: z.array(
      SelectSnippetDto.pick({
        title: true,
        slug: true,
        language: true,
        createdAt: true,
      }).transform((val) => {
        const { slug, createdAt, ...rest } = val;
        return {
          ...rest,
          addedAt: createdAt,
          publicId: slug,
        };
      })
    ),
  }).transform((val) => {
    const { name, ...rest } = val;
    return {
      ...rest,
      username: name,
      fullName: val.firstName.concat(" ", val.lastName),
    };
  })
);
export type GetUserFriendsResDtoType = z.infer<typeof GetUserFriendsResDto>;

// Get User Inbox
export const GetUserInboxResDto = z.array(
  CommonFriendDto.transform((val) => {
    const { name, ...rest } = val;
    return {
      ...rest,
      username: name,
      fullName: val.firstName.concat(" ", val.lastName),
    };
  })
);
export type GetUserInboxResDtoType = z.infer<typeof GetUserInboxResDto>;

// Get User Outbox
export const GetUserOutboxResDto = z.array(
  CommonFriendDto.transform((val) => {
    const { name, ...rest } = val;
    return {
      ...rest,
      username: name,
      fullName: val.firstName.concat(" ", val.lastName),
    };
  })
);
export type GetUserOutboxResDtoType = z.infer<typeof GetUserOutboxResDto>;
