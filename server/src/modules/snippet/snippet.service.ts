import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";
import { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto";
import { UserService } from "../user/user.service";
import {
  generateUniquePrefix,
  handleCursorPagination,
  slugify,
} from "../../common/lib/utils";
import { TagService } from "../tag/tag.service";
import {
  DISCOVER_SNIPPETS_DEFAULT_LIMIT,
  FIND_SNIPPETS_DEFAULT_LIMIT,
} from "./constants";
import { ForkSnippetDtoType } from "./dto/fork-snippet.dto";
import { DeleteSnippetDtoType } from "./dto/delete-snippet.dto";
import { GetSnippetDtoType } from "./dto/get-snippet.dto";
import { DiscoverSnippetsDtoType } from "./dto/discover-snippets.dto";
import { RequestContext } from "../../common/middlewares/request-context-middleware";
import { CollectionService } from "../collections/collection.service";
import { CollectionReadService } from "../collections/collection-read.service";
import { SnippetRepository } from "./snippet.repository";
import { NonNullableFields } from "../../common/types/utils";
import { SnippetsTagsRepository } from "./snippets-tags.repository";
import { SnippetsReadService } from "./snippets-read.service";
import { TagReadService } from "../tag/tag-read.service";
import { UserReadService } from "../user/user-read.service";
import { GetCollectionSnippetsDtoType } from "./dto/get-collection-snippets";
import { User } from "../../common/db/schema";

export class SnippetService {
  public readonly UserService: UserService;
  public readonly CollectionService: CollectionService;
  public readonly CollectionReadService: CollectionReadService;
  public readonly TagService: TagService;
  public readonly SnippetRepository: SnippetRepository;
  private readonly SnippetsTagsRepository: SnippetsTagsRepository;
  private readonly SnippetsReadService: SnippetsReadService;
  private readonly TagReadService: TagReadService;
  private readonly UserReadService: UserReadService;

  constructor() {
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

  public async create(
    ctx: NonNullableFields<RequestContext>,
    input: CreateSnippetDtoType & { forkedFrom?: number }
  ) {
    const { title, tags, collection, forkedFrom, ...rest } = input;

    let foundCollection = await this.CollectionReadService.findOneSlim(
      "slug",
      collection
    );
    if (!foundCollection) {
      foundCollection = await this.CollectionReadService.findOneSlimByOldSlug(
        collection
      );
    }

    if (!foundCollection) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Collection ${collection} is not found.`
      );
    }

    const titleSlug = slugify(input.title);
    const randomPrefix = generateUniquePrefix();

    const [newSnippet] = await this.SnippetRepository.insert([
      {
        title,
        collectionId: foundCollection.id,
        slug: randomPrefix.concat("-", titleSlug),
        creatorId: ctx.user.id,
        ...(forkedFrom ? { forkedFrom } : {}),
        ...rest,
      },
    ]);

    if (tags && tags.length) {
      const tagsDocs = await this.TagService.ensureTagsExistence(
        tags,
        ctx.user.id
      );

      await this.SnippetsTagsRepository.insert(
        tagsDocs.map((tag) => ({
          tagId: tag.id,
          snippetId: newSnippet.id,
        }))
      );
    }

    return {
      ...newSnippet,
      collectionSlug: foundCollection.slug,
      // can be obtained from session
      creatorName: ctx.user.name,
    };
  }

  public async update(
    ctx: NonNullableFields<RequestContext>,
    input: UpdateSnippetDtoType
  ) {
    const { data, slug } = input;
    const userId = ctx.user.id;

    const foundSnippet = await this.SnippetRepository.findOne(
      "slug",
      slug,
      true
    );

    if (!foundSnippet) {
      return await this.checkOldSnippetSlugAndRedirect(slug);
    }

    if (!foundSnippet || foundSnippet.creatorId !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }

    const { addTags, removeTags, collection, ...rest } = data;

    if (addTags && addTags.length) {
      const tagDocs = await this.TagService.ensureTagsExistence(
        addTags,
        userId
      );

      await this.SnippetsTagsRepository.insert(
        tagDocs.map((tag) => ({
          tagId: tag.id,
          snippetId: foundSnippet.id,
        }))
      );
    }

    if (removeTags && removeTags.length) {
      await this.removeSnippetTags(removeTags, foundSnippet.id);
    }

    let collectionId = null;
    if (collection) {
      const foundCollection = await this.CollectionReadService.findOneSlim(
        "slug",
        collection
      );
      if (!foundCollection) {
        const foundCollectionWithOldSlug =
          await this.CollectionReadService.findOneSlimByOldSlug(collection);
        collectionId = foundCollectionWithOldSlug
          ? foundCollectionWithOldSlug.id
          : null;
      } else {
        collectionId = foundCollection.id;
      }
    }

    let updatedSlug;
    if (data.title) {
      const fixedPart = foundSnippet.slug.split("-")[0];
      updatedSlug = fixedPart.concat("-", slugify(data.title));
    }

    const [updatedSnippet] = await this.SnippetRepository.update(
      foundSnippet.id,
      {
        ...rest,
        ...(updatedSlug ? { slug: updatedSlug } : {}),
        ...(collectionId ? { collectionId } : {}),
      }
    );
    return {
      updatedSnippet: {
        ...updatedSnippet,
        collection: foundSnippet.collection.slug,
        creator: foundSnippet.creator.name,
      },
      collectionId,
    };
  }

  public async delete(
    ctx: NonNullableFields<RequestContext>,
    input: DeleteSnippetDtoType
  ) {
    const { slug } = input;
    const userId = ctx.user.id;

    const foundSnippet = await this.SnippetsReadService.findOneSlim(
      "slug",
      slug
    );
    if (!foundSnippet) {
      return await this.checkOldSnippetSlugAndRedirect(slug);
    }

    if (!foundSnippet || foundSnippet.creatorId !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }

    await this.SnippetRepository.delete(foundSnippet.id);

    return foundSnippet;
  }

  public async fork(
    ctx: NonNullableFields<RequestContext>,
    input: ForkSnippetDtoType
  ) {
    const { slug, collection } = input;
    const foundSnippet = await this.SnippetRepository.findOne("slug", slug);

    if (!foundSnippet) {
      return await this.checkOldSnippetSlugAndRedirect(slug);
    }

    if (!foundSnippet) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Snippet ${slug} is not found.`
      );
    }

    if (foundSnippet.creatorId === ctx.user.id) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Snippet ${foundSnippet.title} is already in your snippets list.`
      );
    }

    if (!foundSnippet.allowForking) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        `Forking ${foundSnippet.title} is not allowed.`
      );
    }

    const {
      title,
      description,
      code,
      language,
      isPrivate,
      allowForking,
      tags,
    } = foundSnippet;

    const newSnippet = await this.create(ctx, {
      title,
      description,
      isPrivate,
      allowForking,
      code,
      language,
      collection,
      tags: tags.map((tag) => tag.tag.name),
      forkedFrom: foundSnippet.id,
    });

    return {
      ...newSnippet,
      collection: foundSnippet.collection.slug,
      creator: foundSnippet.creator.name,
    };
  }

  public async discover(_ctx: RequestContext, input: DiscoverSnippetsDtoType) {
    const { limit } = input;
    const defaultLimit = limit ?? DISCOVER_SNIPPETS_DEFAULT_LIMIT;

    const { data, total } = await this.SnippetsReadService.discover({
      ...input,
      limit: defaultLimit,
    });

    const { nextCursor, data: paginatedData } = handleCursorPagination({
      data: data,
      limit: defaultLimit,
    });

    return {
      items: paginatedData,
      nextCursor: nextCursor
        ? ({
            updatedAt: nextCursor.updatedAt,
          } satisfies DiscoverSnippetsDtoType["cursor"])
        : null,
      total,
    };
  }

  public async getCurrentUserSnippets(
    ctx: NonNullableFields<RequestContext>,
    input: Omit<GetUserSnippetsDtoType, "creatorName">
  ) {
    const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
    const snippets = await this.getUserSnippets(ctx, {
      ...input,
      user: foundUser,
    });
    return snippets;
  }

  public async getUserSnippets(
    ctx: RequestContext,
    input: Partial<GetUserSnippetsDtoType> & { user?: User }
  ) {
    const { limit, creatorName, user } = input;
    const defaultLimit = limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;

    const checkUserExists = user ? false : true;
    let foundUser = user ? user : null;

    if (checkUserExists && creatorName) {
      foundUser =
        (await this.UserReadService.findOneSlim("name", creatorName)) ?? null;
      if (!foundUser) {
        foundUser =
          (await this.UserReadService.findOneByOldNames(creatorName)) ?? null;
        if (!foundUser) {
          throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
        }
        return { redirect: true, name: foundUser.name };
      }
    }

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
    }

    const isCurrentUserOwner = ctx?.user?.id === foundUser.id;

    const { data, total } = await this.SnippetsReadService.findUserSnippets(
      {
        ...input,
        limit: defaultLimit,
      },
      foundUser.id,
      isCurrentUserOwner
    );

    const { nextCursor, data: paginatedData } = handleCursorPagination({
      data,
      limit: defaultLimit,
    });

    return {
      items: paginatedData,
      nextCursor: nextCursor
        ? ({
            updatedAt: nextCursor.updatedAt,
          } satisfies GetUserSnippetsDtoType["cursor"])
        : null,
      total,
    };
  }

  public async getCurrentUserFriendsSnippets(
    ctx: NonNullableFields<RequestContext>,
    input: Omit<GetUserSnippetsDtoType, "creatorName">
  ) {
    const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);

    const snippets = await this.getUserFriendsSnippets(ctx, {
      ...input,
      user: foundUser,
    });
    return snippets;
  }

  public async getUserFriendsSnippets(
    _ctx: RequestContext,
    input: Partial<GetUserSnippetsDtoType> & { user?: User }
  ) {
    const { limit, creatorName, user } = input;
    const defaultLimit = limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;
    const checkUserExists = user ? false : true;
    let foundUser = user ? user : null;

    if (checkUserExists && creatorName) {
      foundUser =
        (await this.UserReadService.findOneSlim("name", creatorName)) ?? null;
      if (!foundUser) {
        foundUser =
          (await this.UserReadService.findOneByOldNames(creatorName)) ?? null;
        if (!foundUser) {
          throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
        }
        return { redirect: true, name: foundUser.name };
      }
    }

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, `User not found.`);
    }

    const { data, total } =
      await this.SnippetsReadService.findUserFriendsSnippets(
        {
          ...input,
          limit: defaultLimit,
        },
        foundUser.id
      );

    const { nextCursor, data: paginatedData } = handleCursorPagination({
      data,
      limit: defaultLimit,
    });
    return {
      items: paginatedData,
      nextCursor: nextCursor
        ? ({
            updatedAt: nextCursor.updatedAt,
          } satisfies GetUserSnippetsDtoType["cursor"])
        : null,
      total,
    };
  }

  public async findOne(ctx: RequestContext, input: GetSnippetDtoType) {
    let foundSnippet = await this.SnippetsReadService.findOneSlim(
      "slug",
      input.slug
    );
    if (!foundSnippet) {
      return this.checkOldSnippetSlugAndRedirect(input.slug);
    }

    if (!foundSnippet) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }

    const isOwner = ctx.user?.id === foundSnippet.creatorId;

    const fullSnippet = await this.SnippetRepository.findOne(
      "id",
      foundSnippet.id,
      isOwner
    );

    if (!fullSnippet) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }
    return fullSnippet;
  }

  public async getSnippetsByCollection(
    ctx: RequestContext,
    input: GetCollectionSnippetsDtoType
  ) {
    const defaultLimit = input.limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;
    let foundCollection = await this.CollectionReadService.findOneSlim(
      "slug",
      input.collection
    );

    if (!foundCollection) {
      const foundCollectionWithOldSlug =
        await this.CollectionReadService.findOneSlimByOldSlug(input.collection);
      if (!foundCollectionWithOldSlug) {
        throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
      }
      return { redirect: true, slug: foundCollectionWithOldSlug.slug };
    }

    const isCurrentUserOwner = foundCollection.creatorId === ctx.user?.id;

    let { data, total } =
      await this.SnippetsReadService.findSnippetsByCollection(
        {
          ...input,
          limit: defaultLimit,
        },
        foundCollection.id,
        isCurrentUserOwner
      );

    const { data: items, nextCursor } = handleCursorPagination({
      data,
      limit: defaultLimit,
    });

    return {
      items,
      nextCursor: nextCursor
        ? ({
            updatedAt: nextCursor.updatedAt,
          } satisfies GetCollectionSnippetsDtoType["cursor"])
        : null,
      total,
      collection: foundCollection,
    };
  }

  private async removeSnippetTags(names: string[], snippetId: number) {
    const normalized = names.map((n) => n.trim().toLowerCase());

    const tagsToRemove = await this.TagReadService.findTagsByNames(normalized);

    const tagIds = tagsToRemove.map((t) => t.id);

    if (tagIds.length === 0) return; // nothing to remove

    await this.SnippetsTagsRepository.delete({ snippetId, tagIds });
  }

  private async checkOldSnippetSlugAndRedirect(slug: string) {
    const foundSnippetWithOldSlug =
      await this.SnippetsReadService.findOneSlimByOldSlug(slug);
    if (!foundSnippetWithOldSlug) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }
    return { redirect: true, slug: foundSnippetWithOldSlug.slug };
  }
}
