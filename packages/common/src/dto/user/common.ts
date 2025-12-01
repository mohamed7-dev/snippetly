import { z } from "../zod";
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

export const CommonUserResDtoExample = {
  name: "John_doe7",
  firstName: "John",
  lastName: "Doe",
  image: "https://uploadthing...",
  imageKey: "{{key}}",
  bio: "I'm a full-stack developer",
  email: "test@example.com",
  emailVerifiedAt: new Date().toISOString() as unknown as Date,
  createdAt: new Date().toISOString() as unknown as Date,
  updatedAt: new Date().toISOString() as unknown as Date,
  isPrivate: false,
} satisfies z.infer<typeof CommonUserResDto>;

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
