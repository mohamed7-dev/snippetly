import { createCollectionDto, type CreateCollectionDtoType } from '@snippetly/common/dto';

export const createCollectionFormSchema = createCollectionDto.input;

export type CreateCollectionFormSchemaType = CreateCollectionDtoType['input'];
