import z from 'zod';
import {
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    dateTimeFilterOperators,
    idSchema,
    InferDtoType,
    sortDirection,
    stringFilterOperators,
} from '../shared/common-schemas.js';
import { developer } from '../shared/developer.type.js';
import { forbiddenErrorSchema, userInputErrorSchema, withServerErrors } from '../shared/errors.js';
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
const sendFriendshipRequestOutput = withServerErrors(
    z.union([friendshipItem, invalidFriendshipActionError]),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const sendFriendshipRequestDto = {
    input: friendshipRequestInput,
    output: sendFriendshipRequestOutput,
};

export type SendFriendshipRequestDtoType = InferDtoType<typeof sendFriendshipRequestDto>;

// ############################## Accept #############################
const acceptFriendshipRequestOutput = withServerErrors(
    z.union([friendshipItem, invalidFriendshipActionError]),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const acceptFriendshipRequestDto = {
    input: friendshipRequestInput,
    output: acceptFriendshipRequestOutput,
};

export type AcceptFriendshipRequestDtoType = InferDtoType<typeof acceptFriendshipRequestDto>;

// ############################## Reject #############################
const rejectFriendshipRequestOutput = withServerErrors(
    z.union([friendshipItem, invalidFriendshipActionError]),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const rejectFriendshipRequestDto = {
    input: friendshipRequestInput,
    output: rejectFriendshipRequestOutput,
};

export type RejectFriendshipRequestDtoType = InferDtoType<typeof rejectFriendshipRequestDto>;

// ############################## Cancel #############################
const cancelFriendshipRequestOutput = withServerErrors(
    z.union([friendshipItem, invalidFriendshipActionError]),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const cancelFriendshipRequestDto = {
    input: friendshipRequestInput,
    output: cancelFriendshipRequestOutput,
};

export type CancelFriendshipRequestDtoType = InferDtoType<typeof cancelFriendshipRequestDto>;

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

const currentUserFriendsListOutput = withServerErrors(createPaginatedListOutputSchema(friendshipItem), [
    userInputErrorSchema,
    forbiddenErrorSchema,
]);

export const currentUserFriendsListDto = {
    input: currentUserFriendsListInput,
    output: currentUserFriendsListOutput,
};

export type CurrentUserFriendsListDtoType = InferDtoType<typeof currentUserFriendsListDto>;

// ############################## Inbox #############################
const currentUserInboxListInput = createPaginatedListInputSchema(z.object({}), z.object({}))
    .unwrap()
    .partial();

const currentUserInboxListOutput = withServerErrors(createPaginatedListOutputSchema(friendshipItem), [
    userInputErrorSchema,
    forbiddenErrorSchema,
]);

export const currentUserInboxListDto = {
    input: currentUserInboxListInput,
    output: currentUserInboxListOutput,
};

export type CurrentUserInboxListDtoType = InferDtoType<typeof currentUserInboxListDto>;

// ############################## Outbox #############################
const currentUserOutboxListInput = createPaginatedListInputSchema(z.object({}), z.object({}))
    .unwrap()
    .partial();

const currentUserOutboxListOutput = withServerErrors(createPaginatedListOutputSchema(friendshipItem), [
    userInputErrorSchema,
    forbiddenErrorSchema,
]);

export const currentUserOutboxListDto = {
    input: currentUserOutboxListInput,
    output: currentUserOutboxListOutput,
};

export type CurrentUserOutboxListDtoType = InferDtoType<typeof currentUserOutboxListDto>;
