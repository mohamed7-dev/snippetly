import { createSnippetDto, type CreateSnippetDtoType } from '@snippetly/common/dto';

export const createSnippetFormSchema = createSnippetDto.input;

export type CreateSnippetFormSchemaType = CreateSnippetDtoType['input'];
