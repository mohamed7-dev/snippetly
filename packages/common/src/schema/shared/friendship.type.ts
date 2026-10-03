import z from 'zod';
import { node } from './common-schemas.js';
import { developer } from './developer.type.js';

export enum FriendshipStatus {
    Pending = 'Pending',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
    Cancelled = 'Cancelled',
}

export const friendshipStatusSchema = z.enum(FriendshipStatus);

export const friendship = node.extend({
    requester: developer,
    addressee: developer,
    acceptedAt: z.coerce.date().nullable(),
    rejectedAt: z.coerce.date().nullable(),
    cancelledAt: z.coerce.date().nullable(),
    status: friendshipStatusSchema,
});
