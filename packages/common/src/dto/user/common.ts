import { z } from "../zod";
import { SelectFriendshipDto } from "./select-friendship.dto";
import { SelectUserDto } from "./select-user.dto";

export const CommonUserResDto = SelectUserDto.pick({
  name: true,
  firstName: true,
  lastName: true,
  image: true,
  imageKey: true,
  bio: true,
  email: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  isPrivate: true,
});

export const UPLOAD_THING_URL_EXAMPLE =
  "https://3dszvf0s6v.ufs.sh/f/mKbzgiXo362DmiDstAcXo362DfKsYp9LXCPjJAE0OZ8c4ged";
export const UPLOAD_THING_KEY_EXAMPLE =
  "mKbzgiXo362DmiDstAcXo362DfKsYp9LXCPjJAE0OZ8c4ged";

// User Activity Stats
export const UserActivityStatsDto = z.object({
  snippetsCount: z.number(),
  collectionsCount: z.number(),
  forkedSnippetsCount: z.number(),
  forkedCollectionsCount: z.number(),
  friendsCount: z.number(),
  friendsInboxCount: z.number(),
  friendsOutboxCount: z.number(),
});

export const UserActivityExample = {
  snippetsCount: 100,
  collectionsCount: 10,
  forkedSnippetsCount: 5,
  forkedCollectionsCount: 8,
  friendsCount: 200,
  friendsInboxCount: 6,
  friendsOutboxCount: 1,
} satisfies z.infer<typeof UserActivityStatsDto>;

export const CommonFriendshipResDto = SelectFriendshipDto.omit({
  updatedAt: true,
  id: true,
});
