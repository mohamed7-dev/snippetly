import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";
import { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto";
import { UserService } from "../user/user.service";
import {
  createUniqueSlug,
  handleCursorPagination,
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
    input: CreateSnippetDtoType
  ) {
    const { title, tags, collection, ...rest } = input;

    const [foundCollection] = await this.CollectionReadService.findOneSlim(
      "slug",
      collection
    );

    if (!foundCollection) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Collection ${collection} is not found.`
      );
    }

    const [newSnippet] = await this.SnippetRepository.insert([
      {
        title,
        collectionId: foundCollection.id,
        slug: createUniqueSlug(input.title),
        creatorId: ctx.user.id,
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

    return newSnippet;
  }

  public async update(
    ctx: NonNullableFields<RequestContext>,
    input: UpdateSnippetDtoType
  ) {
    const { data, slug } = input;
    const userId = ctx.user.id;
    const foundSnippet = await this.SnippetsReadService.findOneSlim(
      "slug",
      slug
    );

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
      const [foundCollection] = await this.CollectionReadService.findOneSlim(
        "slug",
        collection
      );
      if (!foundCollection) {
        collectionId = null;
      } else {
        collectionId = foundCollection.id;
      }
    }
    const [updatedSnippet] = await this.SnippetRepository.update(
      foundSnippet.id,
      {
        ...rest,
        ...(collectionId ? { collectionId } : {}),
      }
    );
    return { updatedSnippet, collectionId };
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
    const foundSnippet = await this.SnippetsReadService.findOneWithTags(
      "slug",
      slug
    );
    if (!foundSnippet) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Snippet ${slug} is not found.`
      );
    }
    if (!foundSnippet.allowForking) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        `Forking ${foundSnippet.title} is not allowed.`
      );
    }
    const userId = ctx.user.id;

    if (foundSnippet.creatorId === userId) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Snippet ${foundSnippet.title} is already in your snippets list.`
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
    });

    // track forked snippets
    return newSnippet;
  }

  public async discover(_ctx: RequestContext, input: DiscoverSnippetsDtoType) {
    const { limit } = input;
    const defaultLimit = limit ?? DISCOVER_SNIPPETS_DEFAULT_LIMIT;

    // TODO: extend discover to include forked count
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
    input: Omit<GetUserSnippetsDtoType, "creator">
  ) {
    const loggedInUserName = ctx.user.name;
    const snippets = await this.getUserSnippets(ctx, {
      ...input,
      creator: loggedInUserName,
    });
    return snippets;
  }

  public async getUserSnippets(
    ctx: RequestContext,
    input: GetUserSnippetsDtoType
  ) {
    const { limit, creator } = input;
    const defaultLimit = limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;

    const foundUser = await this.UserReadService.findOneSlim("name", creator);

    if (!foundUser) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with the name ${creator} is not found.`
      );
    }

    const isCurrentUserOwner = ctx?.user?.name === foundUser.name;

    const { data, total } = await this.SnippetsReadService.findUserSnippets(
      {
        ...input,
        limit: defaultLimit,
      },
      foundUser.id,
      isCurrentUserOwner
    );

    // TODO: add stats that includes forked count

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
    input: Omit<GetUserSnippetsDtoType, "creator">
  ) {
    const loggedInUserName = ctx.user.name;
    const snippets = await this.getUserFriendsSnippets(ctx, {
      ...input,
      creator: loggedInUserName,
    });
    return snippets;
  }

  public async getUserFriendsSnippets(
    _ctx: RequestContext,
    input: GetUserSnippetsDtoType
  ) {
    const { limit, creator } = input;
    const defaultLimit = limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;
    const foundUser = await this.UserReadService.findOneSlim("name", creator);
    if (!foundUser) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with the name ${creator} is not found.`
      );
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
    const [foundCollection] = await this.CollectionReadService.findOneSlim(
      "slug",
      input.collection
    );
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
}
