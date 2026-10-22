import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
    addFavouriteDto,
    favouriteCollectionsListDto,
    favouriteDevelopersListDto,
    favouriteSnippetsListDto,
    removeFavouriteDto,
} from '@snippetly/common/dto';
import { registerRoute } from './openapi-route';

export function registerDeveloperFavouritesOpenApi(registry: OpenAPIRegistry): void {
    registerRoute(registry, {
        method: 'post',
        path: '/developer/favourites/{resourceType}/{id}',
        tag: 'Favourites',
        summary: 'Add a snippet, collection, or developer to favourites',
        params: addFavouriteDto.input,
        response: addFavouriteDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'delete',
        path: '/developer/favourites/{resourceType}/{id}',
        tag: 'Favourites',
        summary: 'Remove a snippet, collection, or developer from favourites',
        params: removeFavouriteDto.input,
        response: removeFavouriteDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/favourites/snippets',
        tag: 'Favourites',
        summary: 'List the current developer favourite snippets',
        query: favouriteSnippetsListDto.input,
        response: favouriteSnippetsListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/favourites/collections',
        tag: 'Favourites',
        summary: 'List the current developer favourite collections',
        query: favouriteCollectionsListDto.input,
        response: favouriteCollectionsListDto.output,
        authenticated: true,
    });

    registerRoute(registry, {
        method: 'get',
        path: '/developer/favourites/developers',
        tag: 'Favourites',
        summary: 'List the current developer favourite developers',
        query: favouriteDevelopersListDto.input,
        response: favouriteDevelopersListDto.output,
        authenticated: true,
    });
}
