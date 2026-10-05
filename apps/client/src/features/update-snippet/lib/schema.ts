import { updateSnippetDto, type UpdateSnippetDtoType } from '@snippetly/common/dto';

export const updateSnippetFormSchema = updateSnippetDto.input;

export type UpdateSnippetFormSchemaType = UpdateSnippetDtoType['input'];
