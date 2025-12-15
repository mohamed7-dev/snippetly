import { baseModelSchema, z } from "../zod";

export const SelectFriendshipDto = baseModelSchema.extend({
  requesterId: z.number(),
  addresseeId: z.number(),
  status: z
    .enum(["pending", "accepted", "rejected", "cancelled"])
    .default("pending"),
  acceptedAt: z.date().nullish(),
  rejectedAt: z.date().nullish(),
  cancelledAt: z.date().nullish(),
});

export type SelectFriendshipDtoType = z.infer<typeof SelectFriendshipDto>;
