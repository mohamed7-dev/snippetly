import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { FavouritesPageTabs } from '@/features/favourites/components/sections/favourites-page-tabs';
import {
    favouriteCollectionsListDto,
    favouriteDevelopersListDto,
    favouriteSnippetsListDto,
} from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const searchSchema = z
    .object({
        tab: z.enum(['snippets', 'collections', 'developers']).default('snippets').catch('snippets'),
        snippets: z
            .object({
                filter: favouriteSnippetsListDto.input.shape.filter,
                sort: favouriteSnippetsListDto.input.shape.sort,
                filterOperator: favouriteSnippetsListDto.input.shape.filterOperator,
                tags: favouriteSnippetsListDto.input.shape.tags,
            })
            .partial(),
        collections: z
            .object({
                filter: favouriteCollectionsListDto.input.shape.filter,
                sort: favouriteCollectionsListDto.input.shape.sort,
                filterOperator: favouriteCollectionsListDto.input.shape.filterOperator,
                tags: favouriteCollectionsListDto.input.shape.tags,
            })
            .partial(),
        developers: z
            .object({
                filter: favouriteDevelopersListDto.input.shape.filter,
                sort: favouriteDevelopersListDto.input.shape.sort,
                filterOperator: favouriteDevelopersListDto.input.shape.filterOperator,
            })
            .partial(),
    })
    .partial()
    .optional();

export const Route = createFileRoute('/(protected)/dashboard/_dashboard-layout/favourites/')({
    component: FavouritesPage,
    validateSearch: searchSchema,
    head: () => ({
        meta: [{ title: 'Favourites' }],
    }),
});

function FavouritesPage() {
    return (
        <Page>
            <PageTitle>Favourites</PageTitle>
            <PageDescription>Your saved snippets, collections, and developers.</PageDescription>
            <FavouritesPageTabs />
        </Page>
    );
}
