import {
  CreateSnippetRequestDtoType,
  DeleteSnippetRequestParamDtoType,
  DiscoverSnippetsRequestQueryDtoType,
  ForkSnippetRequestBodyDtoType,
  ForkSnippetRequestParamDtoType,
  GetCollectionSnippetsRequestParamDtoType,
  GetCollectionSnippetsRequestQueryDtoType,
  GetSnippetRequestParamDtoType,
  GetUserSnippetsRequestParamDtoType,
  GetUserSnippetsRequestQueryDtoType,
  UpdateSnippetRequestBodyDtoType,
  UpdateSnippetRequestParamDtoType,
} from "@snippetly/common/dto";
import { StatusCodes } from "http-status-codes";
import type { Tags, User } from "../../common/db/schema";
import { HttpException } from "../../common/lib/exception";
import {
  generateUniquePrefix,
  handleCursorPagination,
  slugify,
} from "../../common/lib/utils";
import type { RequestContext } from "../../common/middlewares/request-context-middleware";
import type { NonNullableFields } from "../../common/types/utils";
import { CollectionReadService } from "../collections/collection-read.service";
import { CollectionService } from "../collections/collection.service";
import { TagReadService } from "../tag/tag-read.service";
import { TagService } from "../tag/tag.service";
import { UserReadService } from "../user/user-read.service";
import { UserService } from "../user/user.service";
import {
  DISCOVER_SNIPPETS_DEFAULT_LIMIT,
  FIND_SNIPPETS_DEFAULT_LIMIT,
} from "./constants";
import { SnippetRepository } from "./snippet.repository";
import { SnippetsReadService } from "./snippets-read.service";
import { SnippetsTagsRepository } from "./snippets-tags.repository";

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
    input: CreateSnippetRequestDtoType & { forkedFrom?: number },
  ) {
    const { title, tags, collectionSlug, forkedFrom, ...rest } = input;

    let foundCollection = await this.CollectionReadService.findOneSlim(
      "slug",
      collectionSlug,
    );
    if (!foundCollection) {
      foundCollection =
        await this.CollectionReadService.findOneSlimByOldSlug(collectionSlug);
    }

    if (!foundCollection) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Collection ${collectionSlug} is not found.`,
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
        ctx.user.id,
      );

      await this.SnippetsTagsRepository.insert(
        tagsDocs.map((tag) => ({
          tagId: tag.id,
          snippetId: newSnippet.id,
        })),
      );
    }

    return {
      ...newSnippet,
      collectionSlug: foundCollection.slug,
      creatorName: ctx.user.name,
    };
  }

  public async update(
    ctx: NonNullableFields<RequestContext>,
    input: {
      params: UpdateSnippetRequestParamDtoType;
      data: UpdateSnippetRequestBodyDtoType;
    },
  ) {
    const {
      data,
      params: { slug },
    } = input;
    const userId = ctx.user.id;

    const foundSnippet = await this.SnippetRepository.findOne(
      "slug",
      slug,
      true,
    );

    if (!foundSnippet) {
      return await this.checkOldSnippetSlugAndRedirect(slug);
    }

    if (!foundSnippet || foundSnippet.creatorId !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }

    const { addTags, removeTags, collectionSlug, title, ...rest } = data;

    if (addTags && addTags.length) {
      const tagDocs = await this.TagService.ensureTagsExistence(
        addTags,
        userId,
      );

      await this.SnippetsTagsRepository.insert(
        tagDocs.map((tag) => ({
          tagId: tag.id,
          snippetId: foundSnippet.id,
        })),
      );
    }

    if (removeTags && removeTags.length) {
      await this.removeSnippetTags(removeTags, foundSnippet.id);
    }

    let collectionId = null;
    if (collectionSlug) {
      const foundCollection = await this.CollectionReadService.findOneSlim(
        "slug",
        collectionSlug,
      );
      if (!foundCollection) {
        const foundCollectionWithOldSlug =
          await this.CollectionReadService.findOneSlimByOldSlug(collectionSlug);
        collectionId = foundCollectionWithOldSlug
          ? foundCollectionWithOldSlug.id
          : null;
      } else {
        collectionId = foundCollection.id;
      }
    }

    let updatedSlug;
    const oldSlugs = foundSnippet.oldSlugs;
    if (title) {
      const fixedPart = foundSnippet.slug.split("-")[0];
      updatedSlug = fixedPart.concat("-", slugify(title));
      const foundOld = oldSlugs.find((os) => os === foundSnippet.slug);
      if (!foundOld) {
        oldSlugs.push(foundSnippet.slug);
      }
    }

    const [updatedSnippet] = await this.SnippetRepository.update(
      foundSnippet.id,
      {
        ...rest,
        title,
        // ...(updatedSlug ? { slug: updatedSlug, oldSlugs } : {}),
        ...(collectionId ? { collectionId } : {}),
      },
    );
    return {
      updatedSnippet: {
        ...updatedSnippet,
        collectionSlug: foundSnippet.collection.slug,
        creatorName: foundSnippet.creator.name,
        forkedFromSlug: foundSnippet?.forkedFrom?.slug ?? null,
      },
      collectionId,
    };
  }

  public async delete(
    ctx: NonNullableFields<RequestContext>,
    input: DeleteSnippetRequestParamDtoType,
  ) {
    const { slug } = input;
    const userId = ctx.user.id;

    const foundSnippet = await this.SnippetsReadService.findOneSlim(
      "slug",
      slug,
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
    input: {
      params: ForkSnippetRequestParamDtoType;
      data: ForkSnippetRequestBodyDtoType;
    },
  ) {
    const {
      params: { slug },
      data: { collectionSlug },
    } = input;
    const foundSnippet = await this.SnippetRepository.findOne("slug", slug);

    if (!foundSnippet) {
      return await this.checkOldSnippetSlugAndRedirect(slug);
    }

    if (!foundSnippet) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Snippet ${slug} is not found.`,
      );
    }

    if (!foundSnippet.allowForking) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        `Forking ${foundSnippet.title} is not allowed.`,
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
      collectionSlug,
      tags: (tags as Pick<Tags, "name">[]).map((tag) => tag.name),
      forkedFrom: foundSnippet.id,
    });

    return {
      ...newSnippet,
      collectionSlug: foundSnippet.collection.slug,
      creatorName: foundSnippet.creator.name,
      forkedFromSlug: foundSnippet.slug,
    };
  }

  public async discover(
    ctx: RequestContext,
    input: DiscoverSnippetsRequestQueryDtoType,
  ) {
    const { limit } = input;
    const defaultLimit = limit ?? DISCOVER_SNIPPETS_DEFAULT_LIMIT;

    const { data, total } = await this.SnippetsReadService.discover({
      ...input,
      limit: defaultLimit,
      loggedInUserId: ctx.user?.id,
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
          } satisfies DiscoverSnippetsRequestQueryDtoType["cursor"])
        : null,
      total,
    };
  }

  public async getCurrentUserSnippets(
    ctx: NonNullableFields<RequestContext>,
    input: GetUserSnippetsRequestQueryDtoType,
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
    input: Partial<
      GetUserSnippetsRequestQueryDtoType & GetUserSnippetsRequestParamDtoType
    > & { user?: User },
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
      isCurrentUserOwner,
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
          } satisfies GetUserSnippetsRequestQueryDtoType["cursor"])
        : null,
      total,
    };
  }

  public async getCurrentUserFriendsSnippets(
    ctx: NonNullableFields<RequestContext>,
    input: GetUserSnippetsRequestQueryDtoType,
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
    input: Partial<
      GetUserSnippetsRequestQueryDtoType & GetUserSnippetsRequestParamDtoType
    > & { user?: User },
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
        foundUser.id,
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
          } satisfies GetUserSnippetsRequestQueryDtoType["cursor"])
        : null,
      total,
    };
  }

  public async findOne(
    ctx: RequestContext,
    input: GetSnippetRequestParamDtoType,
  ) {
    const foundSnippet = await this.SnippetsReadService.findOneSlim(
      "slug",
      input.slug,
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
      isOwner,
    );

    if (!fullSnippet) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }
    return fullSnippet;
  }

  public async getSnippetsByCollection(
    ctx: RequestContext,
    input: GetCollectionSnippetsRequestParamDtoType &
      GetCollectionSnippetsRequestQueryDtoType,
  ) {
    const defaultLimit = input.limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;
    const foundCollection = await this.CollectionReadService.findOneSlim(
      "slug",
      input.collectionSlug,
    );

    if (!foundCollection) {
      const foundCollectionWithOldSlug =
        await this.CollectionReadService.findOneSlimByOldSlug(
          input.collectionSlug,
        );
      if (!foundCollectionWithOldSlug) {
        throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
      }
      return { redirect: true, slug: foundCollectionWithOldSlug.slug };
    }

    const isCurrentUserOwner = foundCollection.creatorId === ctx.user?.id;

    const { data, total } =
      await this.SnippetsReadService.findSnippetsByCollection(
        {
          ...input,
          limit: defaultLimit,
        },
        foundCollection.id,
        isCurrentUserOwner,
      );

    const { data: items, nextCursor } = handleCursorPagination({
      data,
      limit: defaultLimit,
    });

    return {
      items: items.map((item) => ({
        ...item,
        tags: item.tags.map((tag) => ({ name: tag.tag.name })),
      })),
      nextCursor: nextCursor
        ? ({
            updatedAt: nextCursor.updatedAt,
          } satisfies GetCollectionSnippetsRequestQueryDtoType["cursor"])
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
