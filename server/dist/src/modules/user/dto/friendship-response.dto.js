import z from "zod";
import { SelectFriendshipDto } from "./select-friendship.dto.js";
import { SelectUserDto } from "./select-user.dto.js";
import { SelectSnippetDto } from "../../snippet/dto/select-snippet.dto.js";
export const CommonDto = SelectFriendshipDto.omit({
    updatedAt: true,
    id: true
});
// Send Request
export const SendRequestResDto = CommonDto.omit({
    rejectedAt: true,
    acceptedAt: true,
    cancelledAt: true
}).transform((val)=>{
    const { createdAt, status, ...rest } = val;
    return {
        ...rest,
        requestSentAt: createdAt,
        requestStatus: status
    };
});
// Accept Request
export const AcceptRequestResDto = CommonDto.omit({
    rejectedAt: true,
    cancelledAt: true
}).transform((val)=>{
    const { createdAt, status, acceptedAt, ...rest } = val;
    return {
        ...rest,
        requestSentAt: createdAt,
        requestStatus: status,
        requestAcceptedAt: acceptedAt
    };
});
// Reject Request
export const RejectRequestResDto = CommonDto.omit({
    acceptedAt: true,
    cancelledAt: true
}).transform((val)=>{
    const { createdAt, status, rejectedAt, ...rest } = val;
    return {
        ...rest,
        requestSentAt: createdAt,
        requestStatus: status,
        requestRejectedAt: rejectedAt
    };
});
// Cancel Request
export const CancelRequestResDto = CommonDto.omit({
    rejectedAt: true,
    acceptedAt: true
}).transform((val)=>{
    const { createdAt, status, cancelledAt, ...rest } = val;
    return {
        ...rest,
        requestSentAt: createdAt,
        requestStatus: status,
        requestCancelledAt: cancelledAt
    };
});
// ################# Common Friend ##################
const CommonFriendDto = SelectUserDto.pick({
    firstName: true,
    lastName: true,
    name: true,
    image: true,
    bio: true
}).extend({
    requestSentAt: z.date(),
    requestStatus: SelectFriendshipDto.shape.status,
    snippetsCount: z.number()
});
// Get User Friends
export const GetUserFriendsResDto = z.array(CommonFriendDto.extend({
    requestAcceptedAt: z.date(),
    recentSnippets: z.array(SelectSnippetDto.pick({
        title: true,
        slug: true,
        language: true,
        createdAt: true
    }).transform((val)=>{
        const { slug, createdAt, ...rest } = val;
        return {
            ...rest,
            addedAt: createdAt,
            publicId: slug
        };
    }))
}).transform((val)=>{
    const { name, ...rest } = val;
    return {
        ...rest,
        username: name,
        fullName: val.firstName.concat(" ", val.lastName)
    };
}));
// Get User Inbox
export const GetUserInboxResDto = z.array(CommonFriendDto.transform((val)=>{
    const { name, ...rest } = val;
    return {
        ...rest,
        username: name,
        fullName: val.firstName.concat(" ", val.lastName)
    };
}));
// Get User Outbox
export const GetUserOutboxResDto = z.array(CommonFriendDto.transform((val)=>{
    const { name, ...rest } = val;
    return {
        ...rest,
        username: name,
        fullName: val.firstName.concat(" ", val.lastName)
    };
}));
