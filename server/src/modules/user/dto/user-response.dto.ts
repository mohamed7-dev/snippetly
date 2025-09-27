import z from "zod";
import { SelectUserDto } from "./select-user.dto";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto";
import { SelectTagDto } from "../../tag/dto/select-tag.dto";
import { SelectFriendshipDto } from "./select-friendship.dto";

const CommonUserDto = SelectUserDto.pick({
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

export const UpdateUserResDto = CommonUserDto.transform((val) => {
  const { name, createdAt, updatedAt, ...rest } = val;
  return {
    ...rest,
    username: name,
    fullName: val.firstName.concat(" ", val.lastName),
    joinedAt: createdAt,
    lastUpdatedAt: updatedAt,
  };
});
export type UpdateUserResDtoType = z.infer<typeof UpdateUserResDto>;

// User Activity Stats
const UserActivityStatsDto = z.object({
  snippetsCount: z.number(),
  collectionsCount: z.number(),
  forkedSnippetsCount: z.number(),
  forkedCollectionsCount: z.number(),
  friendsCount: z.number(),
  friendsInboxCount: z.number(),
  friendsOutboxCount: z.number(),
});

// Get User Profile (Owner)
export const GetUserProfileResDto = z.object({
  profile: CommonUserDto.transform((val) => {
    const { name, createdAt, updatedAt, ...rest } = val;
    return {
      ...rest,
      username: name,
      fullName: val.firstName.concat(" ", val.lastName),
      joinedAt: createdAt,
      lastUpdatedAt: updatedAt,
    };
  }),
  stats: UserActivityStatsDto,
});

// Get User Profile (Public)
export const GetPublicUserProfileResDto = GetUserProfileResDto.extend({
  friendshipInfo: z.object({
    isCurrentUserAFriend: z.boolean(),
    requestStatus: SelectFriendshipDto.shape.status.nullish(),
  }),
}).transform((val) => {
  const {
    profile: { lastUpdatedAt, isPrivate, emailVerifiedAt, ...restProfile },
    ...rest
  } = val;
  return { ...rest, profile: restProfile };
});

// Get Current User Profile
export const GetCurrentUserProfileResDto = GetUserProfileResDto;

// Get User Dashboard
export const GetCurrentUserDashboardDto = z.object({
  user: GetUserProfileResDto.shape.profile,
  collections: z.array(
    SelectCollectionDto.pick({
      title: true,
      slug: true,
      color: true,
      createdAt: true,
      updatedAt: true,
    })
      .extend({ snippetsCount: z.number() })
      .transform((val) => {
        const { slug, createdAt, updatedAt, ...rest } = val;
        return {
          ...rest,
          publicId: slug,
          addedAt: createdAt,
          lastUpdatedAt: updatedAt,
        };
      })
  ),
  stats: UserActivityStatsDto,
});

// Discover Users
export const DiscoverUsersDto = z.array(
  CommonUserDto.omit({
    emailVerifiedAt: true,
    isPrivate: true,
    updatedAt: true,
  })
    .extend({
      friendsCount: z.number(),
      snippetsCount: z.number(),
      tags: z.array(SelectTagDto.pick({ name: true })),
    })
    .transform((val) => {
      const { name, firstName, lastName, createdAt, ...rest } = val;
      return {
        ...rest,
        username: name,
        fullName: val.firstName.concat(" ", val.lastName),
        joinedAt: createdAt,
      };
    })
);
