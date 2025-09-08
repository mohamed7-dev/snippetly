import z from "zod";
import { SelectTagDto } from "../../tag/dto/select-tag.dto";
import { SelectUserDto } from "../../user/dto/select-user.dto";
import { SelectFolderDto } from "./select-folder.dto";
import { SelectSnippetDto } from "../../snippet/dto/select-snippet.dto";

// Find Folders
export const FindFoldersResponseDto = z.array(
  SelectFolderDto.extend({
    owner: SelectUserDto.pick({
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      id: true,
    }),
    tags: z.array(SelectTagDto).default([]),
  })
);
export type FindFoldersResponseDtoType = z.infer<typeof FindFoldersResponseDto>;

export const FindPublicFoldersResponseDto = z.array(
  FindFoldersResponseDto.unwrap().omit({
    isPrivate: true,
  })
);
export type FindPublicFoldersResponseDtoType = z.infer<
  typeof FindPublicFoldersResponseDto
>;

// Find Folder
export const FindFolderResDto = FindFoldersResponseDto.unwrap().extend({
  snippets: z.array(SelectSnippetDto).default([]),
});
export type FindFolderResDtoType = z.infer<typeof FindFolderResDto>;

export const FindPublicFolderResDto = FindPublicFoldersResponseDto.unwrap();
export type FindPublicFolderResDtoType = z.infer<typeof FindPublicFolderResDto>;

// Create Folder Response
export const CreateFolderResDto = SelectFolderDto;
// Update Folder Response
export const UpdateFolderResDto = SelectFolderDto;
