import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";
import { ISnippet, PopulatedSnippetDocument, Snippet } from "./snippet.model";
import { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto";
import { UserService } from "../user/user.service";
import {
  createUniqueSlug,
  handleCursorPagination,
} from "../../common/lib/utils";
import { FolderService } from "../folder/folder.service";
import { RequestContext } from "../../common/middlewares";
import { TagService } from "../tag/tag.service";
import { FIND_SNIPPETS_DEFAULT_LIMIT } from "./constants";
import { ForkSnippetDtoType } from "./dto/fork-snippet.dto";
import { RootFilterQuery } from "mongoose";
import { DeleteSnippetDtoType } from "./dto/delete-snippet.dto";
import { GetSnippetDtoType } from "./dto/get-snippet.dto";

export class SnippetService {
  public readonly UserService: UserService;
  public readonly FolderService: FolderService;
  public readonly TagService: TagService;

  constructor() {
    this.UserService = new UserService();
    this.FolderService = new FolderService();
    this.TagService = new TagService();
  }

  async create(ctx: RequestContext, input: CreateSnippetDtoType) {
    const { title, tags, folder, ...rest } = input;

    const foundFolder = await this.FolderService.findOneQueryBuilder({
      code: folder,
    });

    if (!foundFolder) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Folder ${folder} is not found.`
      );
    }

    const newSnippet = new Snippet({
      title,
      folder: foundFolder._id,
      slug: createUniqueSlug(input.title),
      owner: ctx.user.id,
      ...rest,
    });

    newSnippet.folder = foundFolder.id;

    if (tags && tags.length) {
      const foundTags = await this.TagService.ensureTagsExistence(tags);
      newSnippet.tags = foundTags.map((tag) => tag.id);
    }

    const [createdSnippet] = await Promise.all([
      await newSnippet.save(),
      this.FolderService.updateFolderSnippets(
        {
          snippetId: newSnippet.id,
          folderId: newSnippet.folder.toString(),
          operation: "Push",
        },
        ctx
      ),
    ]);

    return createdSnippet;
  }

  async update(ctx: RequestContext, input: UpdateSnippetDtoType) {
    const { data, slug } = input;
    const userId = ctx.user.id;
    const foundSnippet = await this.findOneQueryBuilder({ slug });

    if (!foundSnippet || foundSnippet.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }

    const { title, addTags, removeTags, folder, ...rest } = data;

    let addTagsIds = [];
    let removeTagsIds = [];

    if (addTags && addTags.length) {
      const tagDocs = await this.TagService.ensureTagsExistence(addTagsIds);
      addTagsIds = tagDocs.map((doc) => doc.id);
    }
    if (removeTags && removeTags.length) {
      const tagDocs = await this.TagService.findTagsQueryBuilder({
        name: { $in: removeTags.map((t) => t.toLowerCase()) },
      });
      removeTagsIds = tagDocs.map((doc) => doc.id);
    }

    let folderId = null;
    if (folder) {
      const foundFolder = await this.FolderService.findOneQueryBuilder({
        slug: folder,
      });
      if (!foundFolder) {
        folderId = null;
      }
      folderId = foundFolder._id;
    }

    const [updatedSnippet] = await Promise.all([
      Snippet.findOneAndUpdate(
        { slug },
        {
          ...(title ? { slug: createUniqueSlug(title) } : {}),
          ...(addTagsIds.length > 0 && {
            $addToSet: { tags: { $each: addTagsIds } },
          }),
          ...(removeTagsIds.length > 0 && {
            $pull: { tags: { $in: removeTagsIds } },
          }),
          ...(!!folder && !!folderId && { folder: folderId }),
          ...rest,
          $currentDate: { updatedAt: true },
        },
        { new: true }
      ),
      !!folderId &&
        this.FolderService.updateFolderSnippets(
          {
            folderId: foundSnippet.folder.toString(),
            snippetId: foundSnippet.id,
            operation: "Pull",
          },
          ctx
        ),
      !!folderId &&
        this.FolderService.updateFolderSnippets(
          {
            folderId,
            snippetId: foundSnippet.id,
            operation: "Push",
          },
          ctx
        ),
    ]);

    return { updatedSnippet, newFolderId: folderId };
  }

  async delete(ctx: RequestContext, input: DeleteSnippetDtoType) {
    const { slug } = input;
    const userId = ctx.user.id;

    const foundSnippet = await this.findOneQueryBuilder({ slug });

    if (!foundSnippet || foundSnippet.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }
    const deletedSnippet = await Snippet.findOneAndDelete({ slug });

    await this.FolderService.updateFolderSnippets(
      {
        snippetId: deletedSnippet.id,
        folderId: deletedSnippet.folder.toString(),
        operation: "Pull",
      },
      ctx
    );

    return foundSnippet;
  }

  async fork(ctx: RequestContext, input: ForkSnippetDtoType) {
    const { slug, folder } = input;
    const foundSnippet = await this.findOneQueryBuilder({ slug: input.slug });
    if (!foundSnippet) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Snippet ${slug} is not found.`
      );
    }
    if (!foundSnippet.allowForking) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        `Forking ${slug} is not allowed.`
      );
    }
    const {
      title,
      description,
      code,
      parseFormat,
      isPrivate,
      allowForking,
      tags,
    } = foundSnippet;

    const foundFolder = await this.FolderService.findOneQueryBuilder({
      code: folder,
    });
    if (!foundFolder) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Folder ${folder} is not found.`
      );
    }
    const newSnippet = await Snippet.create({
      title,
      slug: createUniqueSlug(title),
      description,
      code,
      parseFormat,
      isPrivate,
      allowForking,
      tags,
      folder: foundFolder._id,
      owner: ctx.user.id,
    });

    return newSnippet;
  }

  async getCurrentUserSnippets(
    ctx: RequestContext,
    input: Omit<GetUserSnippetsDtoType, "name">
  ) {
    const loggedInUserName = ctx.user.name;
    const snippets = await this.getUserSnippets(ctx, {
      ...input,
      name: loggedInUserName,
    });
    return snippets;
  }

  async getUserSnippets(ctx: RequestContext, input: GetUserSnippetsDtoType) {
    const { limit } = input;
    const defaultLimit = limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;

    const { foundUser, filter } = await this.getFilter(ctx, input);

    const isCurrentUserOwner = ctx.user.name === foundUser.name;
    const newFilter = {
      ...filter,
      ...(!isCurrentUserOwner ? { isPrivate: false } : null),
    };

    const [snippets, total] = await Promise.all([
      Snippet.find(newFilter)
        .sort({ updatedAt: -1 })
        .limit(defaultLimit + 1)
        .populate("tags")
        .populate("owner", "firstName lastName name email id")
        .populate("folder", "title code id"),
      Snippet.countDocuments({ owner: foundUser._id }),
    ]);

    const { nextCursor, data: paginatedData } = handleCursorPagination({
      data: snippets,
      limit: defaultLimit,
    });

    return {
      data: paginatedData,
      nextCursor: nextCursor
        ? ({
            updatedAt: nextCursor.updatedAt,
          } satisfies GetUserSnippetsDtoType["cursor"])
        : null,
      total,
    };
  }

  async getUserFriendsSnippets(
    ctx: RequestContext,
    input: GetUserSnippetsDtoType
  ) {
    const { limit } = input;
    const defaultLimit = limit ?? FIND_SNIPPETS_DEFAULT_LIMIT;

    const { foundUser, filter } = await this.getFilter(ctx, input);
    const newFilter = {
      ...filter,
      isPrivate: false,
      owner: [...foundUser.friends],
    };

    const [foundSnippets, total] = await Promise.all([
      Snippet.find(newFilter)
        .sort({ updatedAt: -1 })
        .limit(defaultLimit + 1)
        .populate("owner", "firstName lastName name email id")
        .populate("tags")
        .populate("folder", "title slug id"),
      Snippet.countDocuments({
        owner: [...foundUser.friends],
        isPrivate: false,
      }),
    ]);

    const { nextCursor, data: paginatedData } = handleCursorPagination({
      data: foundSnippets,
      limit: defaultLimit,
    });
    return {
      data: paginatedData,
      nextCursor: nextCursor
        ? ({
            updatedAt: nextCursor.updatedAt,
          } satisfies GetUserSnippetsDtoType["cursor"])
        : null,
      total,
    };
  }

  async findOne(ctx: RequestContext, input: GetSnippetDtoType) {
    const loggedInUserId = ctx.user?.id;

    let foundSnippet = (await this.findOneQueryBuilder({
      slug: input.slug,
    })
      .populate("owner", "firstName lastName name email id")
      .populate("tags")
      .populate(
        "folder",
        "title code id"
      )) as unknown as PopulatedSnippetDocument;

    if (
      loggedInUserId !== foundSnippet.owner._id.toString() &&
      foundSnippet.isPrivate
    ) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }
    return foundSnippet;
  }

  public findOneQueryBuilder(filter: RootFilterQuery<ISnippet>) {
    return Snippet.findOne(filter);
  }

  private async getFilter(_ctx: RequestContext, input: GetUserSnippetsDtoType) {
    const { query, cursor, name } = input;
    const foundUser = await this.UserService.findOneQueryBuilder({
      name,
    });

    if (!foundUser) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User ${name} is not found.`
      );
    }

    const filter: any = {
      owner: foundUser._id,
    };

    if (cursor) {
      filter.updatedAt = { $lt: new Date(cursor.updatedAt) };
    }

    if (query) {
      const regex = new RegExp(query, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    return { foundUser, filter };
  }
}
