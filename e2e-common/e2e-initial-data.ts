import { LanguageCode } from '@snippetly/common/dto';
import { InitialDataInput } from '@snippetly/server';

export const initialData: InitialDataInput = {
    defaultLanguageCode: LanguageCode.English,
    collections: [
        {
            name: 'react hooks',
            slug: 'react-hooks',
            color: 'blue',
            isPrivate: false,
            allowForking: true,
        },
        {
            name: 'nodejs design patterns',
            slug: 'nodejs-design-patterns',
            color: 'green',
            isPrivate: false,
            allowForking: true,
        },
        {
            name: 'docker compose',
            slug: 'docker-compose',
            color: 'blue',
            isPrivate: true,
            allowForking: false,
        },
        {
            name: 'postgresql tips & tricks',
            slug: 'postgresql-tips-tricks',
            color: 'cyan',
            isPrivate: false,
            allowForking: false,
        },
    ],
    snippets: [],
    roles: [],
};
