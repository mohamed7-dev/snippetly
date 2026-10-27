import type { FindOneDeveloperDtoType } from '@snippetly/common/dto';
import type { ApiSuccess } from './api-client';

export function formatDeveloperInfo(
    developer: Pick<ApiSuccess<FindOneDeveloperDtoType['output']>, 'firstName' | 'lastName'>,
) {
    return {
        initials: (developer.firstName.slice(0, 1) ?? '') + ' ' + (developer.lastName.slice(0, 1) ?? ''),
        fullName: (developer.firstName ?? '') + ' ' + (developer.lastName ?? ''),
    };
}
