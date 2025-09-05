import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { DeleteSnippetDtoType } from "./dto/delete-snippet.dto";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";
import { Snippet } from "./snippet.model";
import { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto";
import { UserService } from "../user/user.service";
import { createUniqueSlug } from "../../common/lib/utils";
import { Request } from "express";
import { CollectionService } from "../collection/collection.service";

export class SnippetService {
  public readonly UserService: UserService;
  public readonly CollectionService: CollectionService;

  constructor() {
    this.UserService = new UserService();
    this.CollectionService = new CollectionService();
  }

  async create(req: Request<{}, {}, CreateSnippetDtoType>) {
    const input = req.body;

    const newSnippet = await Snippet.create({
      ...input,
      slug: createUniqueSlug(input.title),
      owner: req.user.id,
    });

    await this.CollectionService.updateCollectionSnippets({
      snippetId: newSnippet.id,
      collectionId: newSnippet.collection.toString(),
      operation: "Push",
    });

    return {
      message: "Snippet has been created successfully.",
      status: StatusCodes.CREATED,
      data: newSnippet,
    };
  }

  async update(
    req: Request<
      { slug: UpdateSnippetDtoType["slug"] },
      {},
      UpdateSnippetDtoType["data"]
    >
  ) {
    const data = req.body;
    const slug = req.params.slug;
    const userId = req.user.id;
    const foundSnippet = await this.findOne({ slug });

    if (!foundSnippet || foundSnippet.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }

    const updatedSnippet = await Snippet.findOneAndUpdate(
      { slug },
      {
        ...data,
        ...(data.title ? { slug: createUniqueSlug(data.title) } : {}),
        $currentDate: { updatedAt: true },
      },
      { new: true }
    );
    return {
      message: "Snippet has been updated successfully.",
      status: StatusCodes.OK,
      data: updatedSnippet,
    };
  }

  async delete(req: Request<DeleteSnippetDtoType>) {
    const { slug } = req.params;
    const userId = req.user.id;

    const foundSnippet = await this.findOne({ slug });

    if (!foundSnippet || foundSnippet.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }
    const deletedSnippet = await Snippet.findOneAndDelete({ slug });

    await this.CollectionService.updateCollectionSnippets({
      snippetId: deletedSnippet.id,
      collectionId: deletedSnippet.collection.toString(),
      operation: "Pull",
    });

    return {
      data: foundSnippet,
      message: "Snippet has been deleted successfully.",
      status: StatusCodes.OK,
    };
  }

  async getUserSnippets(req: Request<GetUserSnippetsDtoType>) {
    const foundUser = await this.UserService.findOneQueryBuilder({
      name: req.params.name,
    });
    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }
    const snippets = await Snippet.find({ owner: foundUser._id });
    return {
      data: snippets,
      message: "Fetched successfully.",
      status: StatusCodes.OK,
    };
  }

  async getUserFriendsSnippets(req: Request<GetUserSnippetsDtoType>) {
    const foundUser = await this.UserService.findOneQueryBuilder({
      name: req.params.name,
    });

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    const foundSnippets = await Snippet.find({
      isPrivate: false,
      owner: [...foundUser.friends],
    }).populate("owner", "firstName lastName name");

    return {
      data: foundSnippets,
      message: "Fetched successfully.",
      status: StatusCodes.OK,
    };
  }

  private async findOne(by: { [key: string]: string }) {
    return await Snippet.findOne(by).lean();
  }
}
