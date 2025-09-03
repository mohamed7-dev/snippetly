import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { Collection } from "../collection/collection.model";
import { CreateSnippetDtoType } from "./dto/create-snippet.dto";
import { DeleteSnippetDtoType } from "./dto/delete-snippet.dto";
import { UpdateSnippetDtoType } from "./dto/update-snippet.dto";
import { Snippet } from "./snippet.model";
import { GetUserSnippetsDtoType } from "./dto/get-user-snippets.dto";
import { UserService } from "../user/user.service";
import { createUniqueSlug } from "../../common/lib/utils";

export class SnippetService {
  public readonly UserService: UserService;
  constructor() {
    this.UserService = new UserService();
  }

  async create(input: CreateSnippetDtoType & { userId: string }) {
    const newSnippet = await Snippet.create({
      ...input,
      slug: createUniqueSlug(input.title),
      owner: input.userId,
    });

    await Collection.findByIdAndUpdate(
      newSnippet.collection,
      {
        $addToSet: { snippets: newSnippet._id },
      },
      { new: true }
    );

    return newSnippet;
  }

  async update(input: UpdateSnippetDtoType & { userId: string }) {
    const { slug, data, userId } = input;
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
    return updatedSnippet;
  }

  async delete(input: DeleteSnippetDtoType & { userId: string }) {
    const { slug, userId } = input;
    const foundSnippet = await this.findOne({ slug });

    if (!foundSnippet || foundSnippet.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Snippet not found.");
    }
    const deletedSnippet = await Snippet.findOneAndDelete({ slug });

    const foundCollection = await Collection.findByIdAndUpdate(
      deletedSnippet.collection,
      {
        $pull: { snippets: deletedSnippet._id },
      }
    ).select("-password");

    return { foundCollection, foundSnippet };
  }

  async getUserSnippets(input: GetUserSnippetsDtoType) {
    const foundUser = await this.UserService.findOneQueryBuilder({
      name: input.name,
    });
    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }
    const snippets = await Snippet.find({ owner: foundUser._id });
    return snippets;
  }

  async getUserFriendsSnippets(input: GetUserSnippetsDtoType) {
    const foundUser = await this.UserService.findOneQueryBuilder({
      name: input.name,
    });

    if (!foundUser) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found.");
    }

    const foundSnippets = await Snippet.find({
      isPrivate: false,
      owner: [...foundUser.friends],
    }).populate("owner", "firstName lastName");

    return foundSnippets;
  }

  private async findOne(by: { [key: string]: string }) {
    return await Snippet.findOne(by).lean();
  }
}
