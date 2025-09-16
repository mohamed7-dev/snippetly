import z from "zod";
import { SelectFriendshipDto } from "./select-friendship.dto";

export const CommonDto = SelectFriendshipDto.omit({
  updatedAt: true,
});

// Send Request
export const SendRequestResDto = CommonDto;

export type SendRequestResDtoType = z.infer<typeof SendRequestResDto>;

// Accept Request
export const AcceptRequestResDto = CommonDto;

export type AcceptRequestResDtoType = z.infer<typeof AcceptRequestResDto>;

// Reject Request
export const RejectRequestResDto = CommonDto;

export type RejectRequestResDtoType = z.infer<typeof RejectRequestResDto>;

// Cancel Request
export const CancelRequestResDto = CommonDto;

export type CancelRequestResDtoType = z.infer<typeof CancelRequestResDto>;
