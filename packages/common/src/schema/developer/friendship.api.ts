import z from 'zod';
import {
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    dateTimeFilterOperators,
    idSchema,
    sortDirection,
    stringFilterOperators,
} from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { friendship } from '../shared/friendship.type.js';
import { invalidFriendshipActionError } from './errors.js';

const friendshipParticipant = developer.pick({
    id: true,
    firstName: true,
    lastName: true,
    image: true,
});

const friendshipItem = friendship.omit({ requester: true, addressee: true }).extend({
    requester: friendshipParticipant,
    addressee: friendshipParticipant,
});

const friendshipRequestInput = z.object({
    friendId: idSchema,
});

// ############################## Send #############################
const sendFriendshipRequestOutput = z.union([friendshipItem, invalidFriendshipActionError]);

export const sendFriendshipRequestDto = {
    input: friendshipRequestInput,
    output: sendFriendshipRequestOutput,
};

export interface SendFriendshipRequestDtoType {
    input: z.infer<typeof friendshipRequestInput>;
    output: z.infer<typeof sendFriendshipRequestOutput>;
}

// ############################## Accept #############################
const acceptFriendshipRequestOutput = z.union([friendshipItem, invalidFriendshipActionError]);

export const acceptFriendshipRequestDto = {
    input: friendshipRequestInput,
    output: acceptFriendshipRequestOutput,
};

export interface AcceptFriendshipRequestDtoType {
    input: z.infer<typeof friendshipRequestInput>;
    output: z.infer<typeof acceptFriendshipRequestOutput>;
}

// ############################## Reject #############################
const rejectFriendshipRequestOutput = z.union([friendshipItem, invalidFriendshipActionError]);

export const rejectFriendshipRequestDto = {
    input: friendshipRequestInput,
    output: rejectFriendshipRequestOutput,
};

export interface RejectFriendshipRequestDtoType {
    input: z.infer<typeof friendshipRequestInput>;
    output: z.infer<typeof rejectFriendshipRequestOutput>;
}

// ############################## Cancel #############################
const cancelFriendshipRequestOutput = z.union([friendshipItem, invalidFriendshipActionError]);

export const cancelFriendshipRequestDto = {
    input: friendshipRequestInput,
    output: cancelFriendshipRequestOutput,
};

export interface CancelFriendshipRequestDtoType {
    input: z.infer<typeof friendshipRequestInput>;
    output: z.infer<typeof cancelFriendshipRequestOutput>;
}

// ############################## Friends #############################
const filterSchema = z.object({
    acceptedAt: dateTimeFilterOperators,
    rejectedAt: dateTimeFilterOperators,
    cancelledAt: dateTimeFilterOperators,
    status: stringFilterOperators,
});

const sortSchema = z.object({
    acceptedAt: sortDirection,
    rejectedAt: sortDirection,
    cancelledAt: sortDirection,
    status: sortDirection,
});

const currentUserFriendsListInput = createPaginatedListInputSchema(
    filterSchema.pick({ acceptedAt: true }),
    sortSchema.pick({ acceptedAt: true }),
)
    .unwrap()
    .partial();

const currentUserFriendsListOutput = createPaginatedListOutputSchema(friendshipItem);

export const currentUserFriendsListDto = {
    input: currentUserFriendsListInput,
    output: currentUserFriendsListOutput,
};

export interface CurrentUserFriendsListDtoType {
    input: z.infer<typeof currentUserFriendsListInput>;
    output: z.infer<typeof currentUserFriendsListOutput>;
}

// ############################## Inbox #############################
const currentUserInboxListInput = createPaginatedListInputSchema(z.object({}), z.object({}))
    .unwrap()
    .partial();

const currentUserInboxListOutput = createPaginatedListOutputSchema(friendshipItem);

export const currentUserInboxListDto = {
    input: currentUserInboxListInput,
    output: currentUserInboxListOutput,
};

export interface CurrentUserInboxListDtoType {
    input: z.infer<typeof currentUserInboxListInput>;
    output: z.infer<typeof currentUserInboxListOutput>;
}

// ############################## Outbox #############################
const currentUserOutboxListInput = createPaginatedListInputSchema(z.object({}), z.object({}))
    .unwrap()
    .partial();

const currentUserOutboxListOutput = createPaginatedListOutputSchema(friendshipItem);

export const currentUserOutboxListDto = {
    input: currentUserOutboxListInput,
    output: currentUserOutboxListOutput,
};

export interface CurrentUserOutboxListDtoType {
    input: z.infer<typeof currentUserOutboxListInput>;
    output: z.infer<typeof currentUserOutboxListOutput>;
}
