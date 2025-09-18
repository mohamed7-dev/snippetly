import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { UpdateCollectionDtoType } from "./dto/update-collection.dto";
import {
  generateUniquePrefix,
  handleCursorPagination,
  slugify,
} from "../../common/lib/utils";
import { DeleteCollectionDtoType } from "./dto/delete-collection.dto";
import { TagService } from "../tag/tag.service";
import {
  DISCOVER_FOLDERS_DEFAULT_LIMIT,
  FIND_FOLDERS_DEFAULT_LIMIT,
} from "./constants";
import { ForkCollectionDtoType } from "./dto/fork-collection.dto";
import { CollectionRepository } from "./collection.repository";
import { CollectionsTagsRepository } from "./collections-tags-repository";
import { CreateCollectionDtoType } from "./dto/create-collection.dto";
import { NonNullableFields } from "../../common/types/utils";
import { TagReadService } from "../tag/tag-read.service";
import { CollectionReadService } from "./collection-read.service";
import {
  DiscoverCollectionsDtoType,
  FindCollectionDtoType,
  FindCollectionsDtoType,
} from "./dto/find-collection.dto";
import { UserReadService } from "../user/user-read.service";
import { RequestContext } from "../../common/middlewares/request-context-middleware";
import { User } from "../../common/db/schema";

export class CollectionService {
  private readonly UserReadService: UserReadService;
  private readonly TagService: TagService;
  private readonly TagReadService: TagReadService;
  private readonly CollectionRepository: CollectionRepository;
  private readonly CollectionReadService: CollectionReadService;
  private readonly CollectionsTagsRepository: CollectionsTagsRepository;

  constructor() {
    this.UserReadService = new UserReadService();
    this.TagService = new TagService();
    this.TagReadService = new TagReadService();
    this.CollectionRepository = new CollectionRepository();
    this.CollectionReadService = new CollectionReadService();
    this.CollectionsTagsRepository = new CollectionsTagsRepository();
  }

  public async create(
    ctx: NonNullableFields<Pick<RequestContext, "user">>,
    input: CreateCollectionDtoType & { forkedFrom?: number }
  ) {
    const { title, tags, forkedFrom, ...rest } = input;
    const prefix = generateUniquePrefix();
    const [newCollection] = await this.CollectionRepository.insert([
      {
        ...rest,
        title,
        slug: prefix.concat("-", slugify(title)),
        creatorId: ctx.user.id,
        ...(forkedFrom ? { forkedFrom } : {}),
      },
    ]);

    if (tags && tags.length) {
      const tagDocs = await this.TagService.ensureTagsExistence(
        tags,
        ctx.user.id
      );
      await this.CollectionsTagsRepository.insert(
        tagDocs.map((tag) => ({
          tagId: tag.id,
          collectionId: newCollection.id,
        }))
      );
    }

    return { ...newCollection, creator: ctx.user.name };
  }

  public async update(
    ctx: NonNullableFields<RequestContext>,
    input: UpdateCollectionDtoType
  ) {
    const { data, slug } = input;
    const foundCollection =
      await this.CollectionReadService.findOneSlimWithCreator("slug", slug);

    if (!foundCollection) {
      return await this.getCollectionByOldSlugAndRedirect(slug);
    }

    const userId = ctx.user.id;
    if (!foundCollection || foundCollection.creatorId !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }
    const { addTags, removeTags, title, ...rest } = data;

    if (addTags && addTags.length) {
      const tagDocs = await this.TagService.ensureTagsExistence(
        addTags,
        ctx.user.id
      );

      await this.CollectionsTagsRepository.insert(
        tagDocs.map((tag) => ({
          tagId: tag.id,
          collectionId: foundCollection.id,
        }))
      );
    }

    if (removeTags && removeTags.length) {
      await this.removeCollectionTags(removeTags, foundCollection.id);
    }

    let updatedSlug;
    if (title) {
      const fixedPart = foundCollection.slug.split("-")[0];
      updatedSlug = fixedPart.concat("-", slugify(title));
    }

    const [updatedCollection] = await this.CollectionRepository.update(
      foundCollection.id,
      {
        ...rest,
        ...(updatedSlug
          ? {
              slug: updatedSlug,
              oldSlugs: [...foundCollection.oldSlugs, foundCollection.slug],
            }
          : {}),
      }
    );

    return { ...updatedCollection, creator: foundCollection.creator.name };
  }

  public async fork(
    ctx: NonNullableFields<RequestContext>,
    input: ForkCollectionDtoType
  ) {
    const { slug } = input;
    const foundCollection = await this.CollectionRepository.findOne(
      "slug",
      slug,
      true
    );

    if (!foundCollection) {
      return await this.getCollectionByOldSlugAndRedirect(slug);
    }

    if (!foundCollection) {
      throw new HttpException(StatusCodes.NOT_FOUND, `Collection not found.`);
    }

    if (!foundCollection.allowForking) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        `Forking ${foundCollection.title} is not allowed.`
      );
    }

    const userId = ctx.user.id;

    if (foundCollection.creatorId === userId) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Collection ${foundCollection.title} is already in your collections list.`
      );
    }

    const { title, description, color, isPrivate, allowForking, tags } =
      foundCollection;

    // TODO: assign public snippets in the original collection to
    // the new Collection
    const newCollection = await this.create(ctx, {
      title,
      description,
      color,
      isPrivate,
      allowForking,
      tags: tags.map((tag) => tag.tag.name),
      forkedFrom: foundCollection.id,
    });

    return {
      ...newCollection,
      forkedFrom: foundCollection.slug,
      // name comes from session when fetching user info
      creator: ctx.user.name,
    };
  }

  public async delete(
    ctx: NonNullableFields<RequestContext>,
    input: DeleteCollectionDtoType
  ) {
    const foundCollection = await this.CollectionReadService.findOneSlim(
      "slug",
      input.slug
    );

    if (!foundCollection) {
      return await this.getCollectionByOldSlugAndRedirect(input.slug);
    }

    const userId = ctx.user.id;
    if (!foundCollection || foundCollection.creatorId !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }

    await this.CollectionRepository.delete(foundCollection.id);

    return foundCollection;
  }

  public async discover(
    _ctx: RequestContext,
    input: DiscoverCollectionsDtoType
  ) {
    const { limit } = input;
    const defaultLimit = limit ?? DISCOVER_FOLDERS_DEFAULT_LIMIT;

    const { data, total } = await this.CollectionReadService.discover({
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
          } satisfies DiscoverCollectionsDtoType["cursor"])
        : null,
      total,
    };
  }

  public async findCurrentUserCollections(
    ctx: NonNullableFields<RequestContext>,
    input: Pick<FindCollectionsDtoType, "limit" | "query" | "cursor">
  ) {
    const foundUser = await this.UserReadService.findOneSlim("id", ctx.user.id);
    const data = await this.find(ctx, {
      user: foundUser,
      ...input,
    });
    return data;
  }

  public async find(
    ctx: RequestContext,
    input: Partial<FindCollectionsDtoType> & { user?: User }
  ) {
    const { limit, creatorName, user } = input;
    const defaultLimit = limit ?? FIND_FOLDERS_DEFAULT_LIMIT;

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

    const { data, total } =
      await this.CollectionReadService.findUserCollections(
        {
          ...input,
          limit: defaultLimit,
        },
        foundUser.id,
        isCurrentUserOwner
      );

    const stats = await this.CollectionReadService.getUserCollectionsStats(
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
          } satisfies FindCollectionsDtoType["cursor"])
        : null,
      stats,
      total,
    };
  }

  public async findOne(ctx: RequestContext, input: FindCollectionDtoType) {
    let foundCollection = await this.CollectionReadService.findOneSlim(
      "slug",
      input.slug
    );

    if (!foundCollection) {
      return await this.getCollectionByOldSlugAndRedirect(input.slug);
    }

    if (!foundCollection) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }

    const isOwner = ctx.user?.id === foundCollection.creatorId;

    const fullCollection = await this.CollectionRepository.findOne(
      "id",
      foundCollection.id,
      isOwner
    );

    if (!fullCollection) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }

    return fullCollection;
  }

  private async removeCollectionTags(names: string[], collectionId: number) {
    const normalized = names.map((n) => n.trim().toLowerCase());

    const tagsToRemove = await this.TagReadService.findTagsByNames(normalized);

    const tagIds = tagsToRemove.map((t) => t.id);

    if (tagIds.length === 0) return; // nothing to remove

    await this.CollectionsTagsRepository.delete({ collectionId, tagIds });
  }

  private async getCollectionByOldSlugAndRedirect(slug: string) {
    const foundCollectionWithOldSlug =
      await this.CollectionReadService.findOneSlimByOldSlug(slug);

    if (!foundCollectionWithOldSlug) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }

    return { redirect: true, slug: foundCollectionWithOldSlug.slug };
  }
}
