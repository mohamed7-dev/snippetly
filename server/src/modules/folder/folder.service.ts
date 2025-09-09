import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { CreateFolderDtoType } from "./dto/create-folder.dto";
import { UpdateFolderDtoType } from "./dto/update-folder.dto";
import {
  createUniqueSlug,
  handleCursorPagination,
} from "../../common/lib/utils";
import { UserService } from "../user/user.service";
import { Folder, FolderDocumentPopulated, IFolder } from "./folder.model";
import { DeleteFolderDtoType } from "./dto/delete-folder.dto";
import { RequestContext } from "../../common/middlewares";
import { TagService } from "../tag/tag.service";
import { FindFolderDtoType, FindFoldersDtoType } from "./dto/find-folder.dto";
import { FIND_FOLDERS_DEFAULT_LIMIT } from "./constants";
import { RootFilterQuery } from "mongoose";
import { ForkFolderDtoType } from "./dto/fork-folder.dto";

export class FolderService {
  private readonly UserService: UserService;
  private readonly TagService: TagService;

  constructor() {
    this.UserService = new UserService();
    this.TagService = new TagService();
  }

  public async create(ctx: RequestContext, input: CreateFolderDtoType) {
    const { title, tags, ...rest } = input;

    const newFolder = new Folder({
      title,
      code: createUniqueSlug(title),
      owner: ctx.user.id,
      ...rest,
    });

    if (tags && tags.length) {
      const tagDocs = await this.TagService.ensureTagsExistence(tags);
      newFolder.tags = tagDocs.map((doc) => doc.id);
    }
    const createdFolder = await newFolder.save();

    await this.UserService.updateUserFolders(
      {
        folderId: createdFolder._id.toString(),
        userId: createdFolder.owner.toString(),
        operation: "Push",
      },
      ctx
    );

    return createdFolder;
  }

  public async update(ctx: RequestContext, input: UpdateFolderDtoType) {
    const { data, code } = input;
    const foundFolder = await this.findOneQueryBuilder({ code });

    const userId = ctx.user.id;
    if (!foundFolder || foundFolder.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Folder not found.");
    }

    const { title, addTags, removeTags, ...rest } = data;

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

    const updatedFolder = await Folder.findOneAndUpdate(
      { code },
      {
        ...(title ? { code: createUniqueSlug(title) } : {}),
        ...(addTagsIds.length > 0 && {
          $addToSet: { tags: { $each: addTagsIds } },
        }),
        ...(removeTagsIds.length > 0 && {
          $pull: { tags: { $in: removeTagsIds } },
        }),
        ...rest,
        $currentDate: { updatedAt: true },
      },
      { new: true }
    );

    return updatedFolder;
  }

  public async fork(ctx: RequestContext, input: ForkFolderDtoType) {
    const { code } = input;
    const foundFolder = await this.findOneQueryBuilder({ code });
    if (!foundFolder) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `Folder ${code} is not found.`
      );
    }
    if (!foundFolder.allowForking) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        `Forking ${code} is not allowed.`
      );
    }

    const userId = ctx.user.id;

    if (foundFolder.owner.toString() === userId) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        `Folder ${code} is already in your folders list.`
      );
    }

    const { title, description, color, isPrivate, allowForking, tags } =
      foundFolder;
    const newFolder = await Folder.create({
      title,
      description,
      color,
      isPrivate,
      allowForking,
      tags,
      code: createUniqueSlug(title),
      owner: userId,
    });
    return newFolder;
  }

  public async updateFolderSnippets(
    {
      folderId,
      snippetId,
      operation,
    }: {
      folderId: string;
      snippetId: string;
      operation: "Pull" | "Push";
    },
    _ctx: RequestContext
  ) {
    const updatedFolder = await Folder.findOneAndUpdate(
      { id: folderId },
      {
        ...(operation === "Push"
          ? { $addToSet: { snippets: snippetId } }
          : null),
        ...(operation === "Pull" ? { $pull: { snippets: snippetId } } : null),
      },
      { new: true }
    );

    return updatedFolder;
  }

  public async delete(ctx: RequestContext, input: DeleteFolderDtoType) {
    const code = input.code;
    const foundFolder = await this.findOneQueryBuilder({ code });
    const userId = ctx.user.id;
    if (!foundFolder || foundFolder.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Folder not found.");
    }

    const deletedFolder = await Folder.findOneAndDelete({ code });

    await this.UserService.updateUserFolders(
      {
        folderId: deletedFolder.id,
        userId: deletedFolder.owner.toString(),
        operation: "Pull",
      },
      ctx
    );

    return foundFolder;
  }

  public async findCurrentUserFolders(
    ctx: RequestContext,
    input: Pick<FindFoldersDtoType, "limit" | "query" | "cursor">
  ) {
    const foundFolders = await this.find(ctx, {
      owner: ctx.user.name,
      ...input,
    });
    return foundFolders;
  }

  public async find(ctx: RequestContext, input: FindFoldersDtoType) {
    const { query, cursor, limit, owner } = input;
    const defaultLimit = limit ?? FIND_FOLDERS_DEFAULT_LIMIT;

    const foundUser = await this.UserService.findOneQueryBuilder({
      name: owner,
    });

    if (!foundUser) {
      throw new HttpException(
        StatusCodes.NOT_FOUND,
        `User with the name ${owner} is not found.`
      );
    }
    const isCurrentUserOwner = ctx.user.name === foundUser.name;
    const filter: any = {
      owner: foundUser._id,
      ...(!isCurrentUserOwner ? { isPrivate: false } : null),
    };

    if (cursor) {
      filter.updatedAt = { $lt: new Date(cursor.updatedAt) };
    }

    if (query) {
      const regex = new RegExp(query, "i");
      filter.$or = [{ title: regex }, { description: regex }, { code: regex }];
    }

    const [folders, total] = await Promise.all([
      Folder.find(filter)
        .sort({ updatedAt: -1 })
        .limit(defaultLimit + 1)
        .populate("tags")
        .populate("owner", "firstName lastName name email"),
      await Folder.countDocuments({ owner: foundUser._id }),
    ]);

    const { nextCursor, data: paginatedData } = handleCursorPagination({
      data: folders,
      limit: defaultLimit,
    });

    return {
      data: paginatedData,
      nextCursor: nextCursor
        ? ({
            updatedAt: nextCursor.updatedAt,
          } satisfies FindFoldersDtoType["cursor"])
        : null,
      total,
    };
  }

  public async findOne(ctx: RequestContext, input: FindFolderDtoType) {
    const loggedInUserId = ctx.user?.id;

    let foundFolder = (await this.findOneQueryBuilder({
      code: input.code,
    })
      .populate("owner", "firstName lastName name email id")
      .populate("tags")) as unknown as FolderDocumentPopulated;

    const isOwner = loggedInUserId === foundFolder.owner._id.toString();

    await foundFolder.populate({
      path: "snippets",
      select: "title slug isPrivate id",
      match: isOwner ? {} : { isPrivate: false },
      options: { sort: { updatedAt: -1 } },
    });
    if (!foundFolder) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }

    return foundFolder;
  }

  public findOneQueryBuilder(filter: RootFilterQuery<IFolder>) {
    return Folder.findOne(filter);
  }
}
