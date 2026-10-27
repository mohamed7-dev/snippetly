import {
    requestEmailAddressChangeDto,
    updateDeveloperAccountDto,
    updatePasswordDto,
    type RequestEmailAddressChangeDtoType,
    type UpdateDeveloperAccountDtoType,
    type UpdatePasswordDtoType,
} from '@snippetly/common/dto';

export const updateDeveloperProfileInfoFormSchema = updateDeveloperAccountDto['input'].omit({
    image: true,
    imageKey: true,
});

export type UpdateDeveloperProfileInfoFormSchemaType = Omit<
    UpdateDeveloperAccountDtoType['input'],
    'image' | 'imageKey'
>;

export const updatePasswordFormSchema = updatePasswordDto['input'];

export type UpdatePasswordFormSchemaType = UpdatePasswordDtoType['input'];

export const requestEmailAddressChangeFormSchema = requestEmailAddressChangeDto['input'];

export type RequestEmailAddressChangeFormSchemaType = RequestEmailAddressChangeDtoType['input'];
