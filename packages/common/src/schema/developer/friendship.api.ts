import z from 'zod';
import {
    createPaginatedListInputSchema,
    createPaginatedListOutputSchema,
    dateTimeFilterOperators,
    idFilterOperators,
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
    bio: true,
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
    friendFirstName: stringFilterOperators,
    friendLastName: stringFilterOperators,
    friendId: idFilterOperators,
});

const sortSchema = z.object({
    acceptedAt: sortDirection,
    friendFirstName: sortDirection,
    friendLastName: sortDirection,
    friendId: sortDirection,
});

const currentUserFriendsListInput = createPaginatedListInputSchema(filterSchema, sortSchema)
    .unwrap()
    .partial();

const currentUserFriendParticipant = friendshipParticipant.extend({
    isFavouritedByCurrentUser: z.boolean(),
    snippetsCount: z.number().int().nonnegative().optional(),
    recentSnippets: z
        .array(
            z.object({
                id: idSchema,
                name: z.string(),
                slug: z.string(),
                language: z.string(),
            }),
        )
        .optional(),
});

const currentUserFriendshipItem = friendshipItem.extend({
    requester: currentUserFriendParticipant,
    addressee: currentUserFriendParticipant,
});

const currentUserFriendsListOutput = withServerErrors(
    createPaginatedListOutputSchema(currentUserFriendshipItem),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const currentUserFriendsListDto = {
    input: currentUserFriendsListInput,
    output: currentUserFriendsListOutput,
};

export type CurrentUserFriendsListDtoType = InferDtoType<typeof currentUserFriendsListDto>;

// ############################## Inbox #############################
const currentUserRequestParticipant = friendshipParticipant.extend({
    isFavouritedByCurrentUser: z.boolean(),
});

const currentUserRequestItem = friendshipItem.extend({
    requester: currentUserRequestParticipant,
    addressee: currentUserRequestParticipant,
});

const currentUserInboxListInput = createPaginatedListInputSchema(
    z.object({
        requesterFirstName: stringFilterOperators,
        requesterLastName: stringFilterOperators,
        requesterId: idFilterOperators,
    }),
    z.object({
        requesterFirstName: sortDirection,
        requesterLastName: sortDirection,
        requesterId: sortDirection,
    }),
)
    .unwrap()
    .partial();

const currentUserInboxListOutput = withServerErrors(createPaginatedListOutputSchema(currentUserRequestItem), [
    userInputErrorSchema,
    forbiddenErrorSchema,
]);

export const currentUserInboxListDto = {
    input: currentUserInboxListInput,
    output: currentUserInboxListOutput,
};

export type CurrentUserInboxListDtoType = InferDtoType<typeof currentUserInboxListDto>;

// ############################## Outbox #############################
const currentUserOutboxListInput = createPaginatedListInputSchema(
    z.object({
        addresseeFirstName: stringFilterOperators,
        addresseeLastName: stringFilterOperators,
        addresseeId: idFilterOperators,
    }),
    z.object({
        addresseeFirstName: sortDirection,
        addresseeLastName: sortDirection,
        addresseeId: sortDirection,
    }),
)
    .unwrap()
    .partial();

const currentUserOutboxListOutput = withServerErrors(
    createPaginatedListOutputSchema(currentUserRequestItem),
    [userInputErrorSchema, forbiddenErrorSchema],
);

export const currentUserOutboxListDto = {
    input: currentUserOutboxListInput,
    output: currentUserOutboxListOutput,
};

export type CurrentUserOutboxListDtoType = InferDtoType<typeof currentUserOutboxListDto>;
