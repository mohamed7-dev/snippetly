import { DEFAULT_LISTING_COUNT } from './constants';

type SkipPaginatedPage = {
    items: unknown[];
    itemsCount: number;
};

export const createSkipPagination = (skip: unknown = undefined, take: unknown = undefined) => {
    const initialSkip = typeof skip === 'number' ? skip : 0;
    const resolvedTake = typeof take === 'number' ? take : DEFAULT_LISTING_COUNT;

    return {
        take: resolvedTake,
        initialSkip,
        getNextPageParam: <TPage extends SkipPaginatedPage>(
            lastPage: TPage,
            _allPages: TPage[],
            lastPageParam: number,
        ) => {
            const nextSkip = lastPageParam + lastPage.items.length;
            return lastPage.items.length > 0 && nextSkip < lastPage.itemsCount ? nextSkip : undefined;
        },
    };
};
