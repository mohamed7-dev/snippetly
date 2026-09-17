import z from 'zod';
import {
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    idSchema,
    sortDirection,
} from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { friendship } from '../shared/friendship.type.js';
import { invalidFriendshipActionError } from './errors.js';

const friendshipParticipant = developer.pick({
    id: true,
    firstName: true,
    lastName: true,
    emailAddress: true,
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
const currentUserFriendsListInput = createPaginatedListInputSchema(
    z.object({}),
    z.object({
        acceptedAt: sortDirection,
    }),
)
    .unwrap()
    .omit({ filter: true });

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
    .omit({ filter: true, sort: true });

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
    .omit({ filter: true, sort: true });

const currentUserOutboxListOutput = createPaginatedListOutputSchema(friendshipItem);

export const currentUserOutboxListDto = {
    input: currentUserOutboxListInput,
    output: currentUserOutboxListOutput,
};

export interface CurrentUserOutboxListDtoType {
    input: z.infer<typeof currentUserOutboxListInput>;
    output: z.infer<typeof currentUserOutboxListOutput>;
}
