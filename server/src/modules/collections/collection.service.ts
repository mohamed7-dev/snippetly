import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { UpdateFolderDtoType } from "./dto/update-collection.dto";
import {
  createUniqueSlug,
  handleCursorPagination,
} from "../../common/lib/utils";
import { DeleteFolderDtoType } from "./dto/delete-collection.dto";
import { TagService } from "../tag/tag.service";
import {
  DISCOVER_FOLDERS_DEFAULT_LIMIT,
  FIND_FOLDERS_DEFAULT_LIMIT,
} from "./constants";
import { ForkFolderDtoType } from "./dto/fork-collection.dto";
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
    input: CreateCollectionDtoType
  ) {
    const { title, tags, ...rest } = input;

    const [newCollection] = await this.CollectionRepository.insert([
      {
        ...rest,
        title,
        slug: createUniqueSlug(title),
        creatorId: ctx.user.id,
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

    return newCollection;
  }

  public async update(
    ctx: NonNullableFields<RequestContext>,
    input: UpdateFolderDtoType
  ) {
    const { data, slug } = input;
    const [foundCollection] = await this.CollectionReadService.findOneSlim(
      "slug",
      slug
    );

    const userId = ctx.user.id;

    if (!foundCollection || foundCollection.creatorId !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }

    const { addTags, removeTags, ...rest } = data;

    if (addTags && addTags.length) {
      const tagDocs = await this.TagService.ensureTagsExistence(
        addTags,
        userId
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

    const [updatedCollection] = await this.CollectionRepository.update(
      foundCollection.id,
      {
        ...rest,
      }
    );

    return updatedCollection;
  }

  public async fork(
    ctx: NonNullableFields<RequestContext>,
    input: ForkFolderDtoType
  ) {
    const { slug } = input;
    const foundCollection = await this.CollectionReadService.findOneWithTags(
      "slug",
      slug
    );

    if (!foundCollection) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Collection ${slug} is not found.`
      );
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

    const newCollection = await this.create(ctx, {
      title,
      description,
      color,
      isPrivate,
      allowForking,
      tags: tags.map((tag) => tag.tag.name),
    });

    // track forked collection

    return newCollection;
  }

  public async delete(
    ctx: NonNullableFields<RequestContext>,
    input: DeleteFolderDtoType
  ) {
    const slug = input.slug;
    const [foundCollection] = await this.CollectionReadService.findOneSlim(
      "slug",
      slug
    );
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

    // TODO: extend discover to include forked count
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

  public async findCurrentUserFolders(
    ctx: NonNullableFields<RequestContext>,
    input: Pick<FindCollectionsDtoType, "limit" | "query" | "cursor">
  ) {
    const foundFolders = await this.find(ctx, {
      creator: ctx.user.name,
      ...input,
    });
    return foundFolders;
  }

  public async find(ctx: RequestContext, input: FindCollectionsDtoType) {
    const { limit, creator } = input;
    const defaultLimit = limit ?? FIND_FOLDERS_DEFAULT_LIMIT;

    const foundUser = await this.UserReadService.findOneSlim("name", creator);

    if (!foundUser) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with the name ${creator} is not found.`
      );
    }

    const isCurrentUserOwner = ctx?.user?.name === foundUser.name;

    const { data, total } =
      await this.CollectionReadService.findUserCollections(
        {
          ...input,
          limit: defaultLimit,
        },
        foundUser.id,
        isCurrentUserOwner
      );

    // TODO: extend stats to include forked count
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
    let [foundCollection] = await this.CollectionReadService.findOneSlim(
      "slug",
      input.slug
    );

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
    return {
      ...fullCollection.data,
      snippetsCount: fullCollection.snippetsCount,
    };
  }

  private async removeCollectionTags(names: string[], collectionId: number) {
    const normalized = names.map((n) => n.trim().toLowerCase());

    const tagsToRemove = await this.TagReadService.findTagsByNames(normalized);

    const tagIds = tagsToRemove.map((t) => t.id);

    if (tagIds.length === 0) return; // nothing to remove

    await this.CollectionsTagsRepository.delete({ collectionId, tagIds });
  }
}
