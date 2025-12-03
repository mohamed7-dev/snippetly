import { baseModelSchema, z } from "../zod";

export const SelectFriendshipDto = baseModelSchema.extend({
  requesterId: z.number(),
  addresseeId: z.number(),
  status: z
    .enum(["pending", "accepted", "rejected", "cancelled"])
    .default("pending"),
  acceptedAt: z.date().nullable().optional(),
  rejectedAt: z.date().nullable().optional(),
  cancelledAt: z.date().nullable().optional(),
});

export type SelectFriendshipDtoType = z.infer<typeof SelectFriendshipDto>;
