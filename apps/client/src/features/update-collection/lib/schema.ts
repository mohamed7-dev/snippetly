import { updateCollectionDto, type UpdateCollectionDtoType } from '@snippetly/common/dto';

export const updateCollectionFormSchema = updateCollectionDto.input;

export type UpdateCollectionFormSchemaType = UpdateCollectionDtoType['input'];
