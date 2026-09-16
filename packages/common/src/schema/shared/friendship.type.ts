import z from 'zod';
import { node } from './common-schemas.js';
import { developer } from './developer.type.js';

export enum FriendshipStatus {
    Pending = 'Pending',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
    Cancelled = 'Cancelled',
}

const friendshipStatusSchema = z.enum(FriendshipStatus);

export const friendship = node.extend({
    requester: developer,
    addressee: developer,
    acceptedAt: z.date().nullable(),
    rejectedAt: z.date().nullable(),
    cancelledAt: z.date().nullable(),
    status: friendshipStatusSchema,
});
