import z from "zod";
import { SelectTagDto } from "../../tag/dto/select-tag.dto";
import { SelectSnippetDto } from "./select-snippet.dto";
import { SelectUserDto } from "../../user/dto/select-user.dto";
import { SelectFolderDto } from "../../folder/dto/select-folder.dto";

// Get User Snippets
export const GetUserSnippetsResponseDto = z.array(
  SelectSnippetDto.omit({ forkedSnippets: true, sharedWith: true }).extend({
    tags: z.array(SelectTagDto.shape.name).default([]),
    owner: SelectUserDto.pick({
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      id: true,
    }),
    folder: SelectFolderDto.pick({ title: true, slug: true, id: true }),
    forkedCount: z.number(),
  })
);
export type GetUserSnippetsResponseDtoType = z.infer<
  typeof GetUserSnippetsResponseDto
>;

// Get Public User Snippets
export const GetPublicUserSnippetsResDto = z.array(
  GetUserSnippetsResponseDto.unwrap().omit({
    isPrivate: true,
  })
);

export type GetPublicUserSnippetsResDtoType = z.infer<
  typeof GetPublicUserSnippetsResDto
>;

// Get Snippet
export const GetSnippetResDto = GetUserSnippetsResponseDto.unwrap();
export type GetSnippetResDtoType = z.infer<typeof GetSnippetResDto>;

export const GetPublicSnippetResDto = GetPublicUserSnippetsResDto.unwrap();
export type GetPublicSnippetResDtoType = z.infer<typeof GetPublicSnippetResDto>;

// Get User Friends
export const GetCurrentUserFriendsDto = z.object({
  items: SelectUserDto.pick({
    name: true,
    firstName: true,
    lastName: true,
    id: true,
  }).extend({
    friends: z.array(
      SelectUserDto.pick({
        firstName: true,
        lastName: true,
        name: true,
        bio: true,
        id: true,
      }).extend({
        recentSnippets: z.array(
          SelectSnippetDto.pick({
            title: true,
            slug: true,
            language: true,
            createdAt: true,
          })
        ),
      })
    ),
  }),
  stats: z.object({
    snippetsCount: z.number(),
  }),
});
