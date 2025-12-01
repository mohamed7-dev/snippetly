import { z } from "../zod";

// TODO: mirror db fields
export const SelectFriendshipDto = z.object();

export type SelectFriendshipDtoType = z.infer<typeof SelectFriendshipDto>;
