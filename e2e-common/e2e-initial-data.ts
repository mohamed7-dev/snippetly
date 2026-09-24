import { LanguageCode } from '@snippetly/common/dto';
import { InitialData } from '@snippetly/server';

export const initialData: InitialData = {
    defaultLanguageCode: LanguageCode.English,
    collections: [],
    snippets: [],
    roles: [],
};
