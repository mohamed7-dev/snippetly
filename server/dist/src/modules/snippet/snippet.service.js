import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception.js";
import { UserService } from "../user/user.service.js";
import { generateUniquePrefix } from "../../common/lib/utils.js";
import { handleCursorPagination } from "../../common/lib/utils.js";
import { slugify } from "../../common/lib/utils.js";
import { TagService } from "../tag/tag.service.js";
import { DISCOVER_SNIPPETS_DEFAULT_LIMIT } from "./constants.js";
import { FIND_SNIPPETS_DEFAULT_LIMIT } from "./constants.js";
import { CollectionService } from "../collections/collection.service.js";
import { CollectionReadService } from "../collections/collection-read.service.js";
import { SnippetRepository } from "./snippet.repository.js";
import { SnippetsTagsRepository } from "./snippets-tags.repository.js";
import { SnippetsReadService } from "./snippets-read.service.js";
import { TagReadService } from "../tag/tag-read.service.js";
import { UserReadService } from "../user/user-read.service.js";
export class SnippetService {
    UserService;
    CollectionService;
    CollectionReadService;
    TagService;
    SnippetRepository;
    SnippetsTagsRepository;
    SnippetsReadService;
    TagReadService;
    UserReadService;
    constructor(){
        this.UserService = new UserService();
        this.UserReadService = new UserReadService();
        this.CollectionService = new CollectionService();
        this.CollectionReadService = new CollectionReadService();
        this.TagService = new TagService();
        this.TagReadService = new TagReadService();
        this.SnippetRepository = new SnippetRepository();
        this.SnippetsTagsRepository = new SnippetsTagsRepository();
        this.SnippetsReadService = new SnippetsReadService();
    }
    async create(ctx, input) {
        const { title, tags, collection, forkedFrom, ...rest } = input;
        let foundCollection = await this.CollectionReadService.findOneSlim("slug", collection);
        if (!foundCollection) {
            foundCollection = await this.CollectionReadService.findOneSlimByOldSlug(collection);
        }
        if (!foundCollection) {
            throw new HttpException(StatusCodes.NOT_FOUND, `Collection ${collection} is not found.`);
        }
        const titleSlug = slugify(input.title);
        const randomPrefix = generateUniquePrefix();
        const [newSnippet] = await this.SnippetRepository.insert([
            {
                title,
                collectionId: foundCollection.id,
                slug: randomPrefix.concat("-", titleSlug),
                creatorId: ctx.user.id,
                ...forkedFrom ? {
                    forkedFrom
                } : {},
                ...rest
            }
        ]);
        if (tags && tags.length) {
            const tagsDocs = await this.TagService.ensureTagsExistence(tags, ctx.user.id);
            await this.SnippetsTagsRepository.insert(tagsDocs.map((tag)=>({
                    tagId: tag.id,
                    snippetId: newSnippet.id
                })));
        }
        return {
            ...newSnippet,
            collectionPublicId: foundCollection.slug,
            // can be obtained from session
            creatorName: ctx.user.name
        };
    }
    async update(ctx, input) {
        const { data, slug } = input;
        const userId = ctx.user.id;
        const foundSnippet = await this.SnippetRepository.findOne("slug", slug, true);
        if (!foundSnippet) {
            return await this.checkOldSnippetSlugAndRedirect(slug);
        }
        if (!foundSnippet || foundSnippet.creatorId !== userId) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
        }
        const { addTags, removeTags, collection, title, ...rest } = data;
        if (addTags && addTags.length) {
            const tagDocs = await this.TagService.ensureTagsExistence(addTags, userId);
            await this.SnippetsTagsRepository.insert(tagDocs.map((tag)=>({
                    tagId: tag.id,
                    snippetId: foundSnippet.id
                })));
        }
        if (removeTags && removeTags.length) {
            await this.removeSnippetTags(removeTags, foundSnippet.id);
        }
        let collectionId = null;
        if (collection) {
            const foundCollection = await this.CollectionReadService.findOneSlim("slug", collection);
            if (!foundCollection) {
                const foundCollectionWithOldSlug = await this.CollectionReadService.findOneSlimByOldSlug(collection);
                collectionId = foundCollectionWithOldSlug ? foundCollectionWithOldSlug.id : null;
            } else {
                collectionId = foundCollection.id;
            }
        }
        let updatedSlug;
        const oldSlugs = foundSnippet.oldSlugs;
        if (title) {
            const fixedPart = foundSnippet.slug.split("-")[0];
            updatedSlug = fixedPart.concat("-", slugify(title));
            const foundOld = oldSlugs.find((os)=>os === foundSnippet.slug);
            if (!foundOld) {
                oldSlugs.push(foundSnippet.slug);
            }
        }
        const [updatedSnippet] = await this.SnippetRepository.update(foundSnippet.id, {
            ...rest,
            title,
            // ...(updatedSlug ? { slug: updatedSlug, oldSlugs } : {}),
            ...collectionId ? {
                collectionId
            } : {}
        });
        return {
            updatedSnippet: {
                ...updatedSnippet,
                collectionPublicId: foundSnippet.collection.slug,
                creatorName: foundSnippet.creator.name
            },
            collectionId
        };
    }
    async delete(ctx, input) {
        const { slug } = input;
        const userId = ctx.user.id;
        const foundSnippet = await this.SnippetsReadService.findOneSlim("slug", slug);
        if (!foundSnippet) {
            return await this.checkOldSnippetSlugAndRedirect(slug);
        }
        if (!foundSnippet || foundSnippet.creatorId !== userId) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
        }
        await this.SnippetRepository.delete(foundSnippet.id);
        return foundSnippet;
    }
    async fork(ctx, input) {
        const { slug, collection } = input;
        const foundSnippet = await this.SnippetRepository.findOne("slug", slug);
        if (!foundSnippet) {
            return await this.checkOldSnippetSlugAndRedirect(slug);
        }
        if (!foundSnippet) {
            throw new HttpException(StatusCodes.NOT_FOUND, `Snippet ${slug} is not found.`);
        }
        if (!foundSnippet.allowForking) {
            throw new HttpException(StatusCodes.FORBIDDEN, `Forking ${foundSnippet.title} is not allowed.`);
        }
        const { title, description, code, language, isPrivate, allowForking, tags } = foundSnippet;
        const newSnippet = await this.create(ctx, {
            title,
            description,
            isPrivate,
            allowForking,
            code,
            language,
            collection,
            tags: tags.map((tag)=>tag.name),
            forkedFrom: foundSnippet.id
        });
        return {
            ...newSnippet,
            collectionPublicId: foundSnippet.collection.slug,
            creatorName: foundSnippet.creator.name
        };
    }
    async discover(_ctx, input) {
        const { limit } = input;
        const defaultLimit = limit ?? DISCOVER_SNIPPETS_DEFAULT_LIMIT;
        const { data, total } = await this.SnippetsReadService.discover({
            ...input,
            limit: defaultLimit
        });
        const { nextCursor, data: paginatedData } = handleCursorPagination({
            data: data,
            limit: defaultLimit
        });
        return {
            items: paginatedData,
            nextCursor: nextCursor ? {
                updatedAt: nextCursor.updatedAt
            } : null,
            total
        };
    }
    async getCurrentUserSnippets(ctx, input) {
        const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
        const snippets = await this.getUserSnippets(ctx, {
            ...input,
            user: foundUser
        });
        return snippets;
    }
    async getUserSnippets(ctx, input) {
        const { limit, creatorName, user } = input;
        const defaultLimit = limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;
        const checkUserExists = user ? false : true;
        let foundUser = user ? user : null;
        if (checkUserExists && creatorName) {
            foundUser = await this.UserReadService.findOneSlim("name", creatorName) ?? null;
            if (!foundUser) {
                foundUser = await this.UserReadService.findOneByOldNames(creatorName) ?? null;
                if (!foundUser) {
                    throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
                }
                return {
                    redirect: true,
                    name: foundUser.name
                };
            }
        }
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
        }
        const isCurrentUserOwner = ctx?.user?.id === foundUser.id;
        const { data, total } = await this.SnippetsReadService.findUserSnippets({
            ...input,
            limit: defaultLimit
        }, foundUser.id, isCurrentUserOwner);
        const { nextCursor, data: paginatedData } = handleCursorPagination({
            data,
            limit: defaultLimit
        });
        return {
            items: paginatedData,
            nextCursor: nextCursor ? {
                updatedAt: nextCursor.updatedAt
            } : null,
            total
        };
    }
    async getCurrentUserFriendsSnippets(ctx, input) {
        const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
        const snippets = await this.getUserFriendsSnippets(ctx, {
            ...input,
            user: foundUser
        });
        return snippets;
    }
    async getUserFriendsSnippets(_ctx, input) {
        const { limit, creatorName, user } = input;
        const defaultLimit = limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;
        const checkUserExists = user ? false : true;
        let foundUser = user ? user : null;
        if (checkUserExists && creatorName) {
            foundUser = await this.UserReadService.findOneSlim("name", creatorName) ?? null;
            if (!foundUser) {
                foundUser = await this.UserReadService.findOneByOldNames(creatorName) ?? null;
                if (!foundUser) {
                    throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
                }
                return {
                    redirect: true,
                    name: foundUser.name
                };
            }
        }
        if (!foundUser) {
            throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
        }
        const { data, total } = await this.SnippetsReadService.findUserFriendsSnippets({
            ...input,
            limit: defaultLimit
        }, foundUser.id);
        const { nextCursor, data: paginatedData } = handleCursorPagination({
            data,
            limit: defaultLimit
        });
        return {
            items: paginatedData,
            nextCursor: nextCursor ? {
                updatedAt: nextCursor.updatedAt
            } : null,
            total
        };
    }
    async findOne(ctx, input) {
        let foundSnippet = await this.SnippetsReadService.findOneSlim("slug", input.slug);
        if (!foundSnippet) {
            return this.checkOldSnippetSlugAndRedirect(input.slug);
        }
        if (!foundSnippet) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
        }
        const isOwner = ctx.user?.id === foundSnippet.creatorId;
        const fullSnippet = await this.SnippetRepository.findOne("id", foundSnippet.id, isOwner);
        if (!fullSnippet) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
        }
        return fullSnippet;
    }
    async getSnippetsByCollection(ctx, input) {
        const defaultLimit = input.limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;
        let foundCollection = await this.CollectionReadService.findOneSlim("slug", input.collection);
        if (!foundCollection) {
            const foundCollectionWithOldSlug = await this.CollectionReadService.findOneSlimByOldSlug(input.collection);
            if (!foundCollectionWithOldSlug) {
                throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
            }
            return {
                redirect: true,
                slug: foundCollectionWithOldSlug.slug
            };
        }
        const isCurrentUserOwner = foundCollection.creatorId === ctx.user?.id;
        let { data, total } = await this.SnippetsReadService.findSnippetsByCollection({
            ...input,
            limit: defaultLimit
        }, foundCollection.id, isCurrentUserOwner);
        const { data: items, nextCursor } = handleCursorPagination({
            data,
            limit: defaultLimit
        });
        return {
            items,
            nextCursor: nextCursor ? {
                updatedAt: nextCursor.updatedAt
            } : null,
            total,
            collection: foundCollection
        };
    }
    async removeSnippetTags(names, snippetId) {
        const normalized = names.map((n)=>n.trim().toLowerCase());
        const tagsToRemove = await this.TagReadService.findTagsByNames(normalized);
        const tagIds = tagsToRemove.map((t)=>t.id);
        if (tagIds.length === 0) return; // nothing to remove
        await this.SnippetsTagsRepository.delete({
            snippetId,
            tagIds
        });
    }
    async checkOldSnippetSlugAndRedirect(slug) {
        const foundSnippetWithOldSlug = await this.SnippetsReadService.findOneSlimByOldSlug(slug);
        if (!foundSnippetWithOldSlug) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
        }
        return {
            redirect: true,
            slug: foundSnippetWithOldSlug.slug
        };
    }
}
