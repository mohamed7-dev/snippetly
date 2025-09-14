import z from "zod";
import { SelectTagDto } from "../../tag/dto/select-tag.dto";
import { SelectUserDto } from "../../user/dto/select-user.dto";
import { SelectSnippetDto } from "../../snippet/dto/select-snippet.dto";
import { SelectCollectionDto } from "./select-collection.dto";

// Find Collections
export const FindCollectionsResponseDto = z.object({
  items: z.array(
    SelectCollectionDto.extend({
      creator: SelectUserDto.pick({
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        id: true,
      }),
      tags: z.array(SelectTagDto.pick({ name: true })),
      snippets: z.array(
        SelectSnippetDto.pick({
          title: true,
          id: true,
          slug: true,
          parseFormat: true,
          isPrivate: true,
          allowForking: true,
        })
      ),
      snippetsCount: z.number(),
      forkedCount: z.number(),
    })
  ),
  stats: z
    .object({
      collectionsCount: z.number(),
      snippetsCount: z.number(),
      forkedCount: z.number(),
      publicCount: z.number(),
    })
    .nullish(),
});

export type FindFoldersResponseDtoType = z.infer<typeof FindFoldersResponseDto>;

export const FindPublicFoldersResponseDto = FindFoldersResponseDto.omit({
  items: true,
}).extend({
  items: z.array(
    FindFoldersResponseDto.shape.items
      .unwrap()
      .omit({
        isPrivate: true,
        snippets: true,
      })
      .extend({
        snippets: z.array(
          FindFoldersResponseDto.shape.items
            .unwrap()
            .shape.snippets.unwrap()
            .omit({
              isPrivate: true,
            })
        ),
      })
  ),
});

export type FindPublicFoldersResponseDtoType = z.infer<
  typeof FindPublicFoldersResponseDto
>;

// Find Folder
export const FindFolderResDto = FindFoldersResponseDto.shape.items
  .unwrap()
  .extend({
    snippets: z
      .array(
        SelectSnippetDto.pick({
          title: true,
          slug: true,
          id: true,
          isPrivate: true,
        })
      )
      .default([]),
  });
export type FindFolderResDtoType = z.infer<typeof FindFolderResDto>;

export const FindPublicFolderResDto =
  FindPublicFoldersResponseDto.shape.items.unwrap();

export type FindPublicFolderResDtoType = z.infer<typeof FindPublicFolderResDto>;

// Create Folder Response
export const CreateCollectionResDto = SelectCollectionDto;

// Update Folder Response
export const UpdateCollectionResDto = SelectCollectionDto;
