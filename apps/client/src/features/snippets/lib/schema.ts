import { createSnippetDto, type CreateSnippetDtoType } from '@snippetly/common/dto';

export const snippetFormSchema = createSnippetDto['input'];
export type SnippetFormSchema = CreateSnippetDtoType['input'] & { id: string };
