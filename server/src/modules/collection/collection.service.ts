import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { Collection } from "./collection.model";
import { CreateCollectionDtoType } from "./dto/create-collection.dto";
import { UpdateCollectionDtoType } from "./dto/update-collection.dto";
import { createUniqueSlug } from "../../common/lib/utils";
import { Request } from "express";
import { UserService } from "../user/user.service";

export class CollectionService {
  private readonly UserService: UserService;
  constructor() {
    this.UserService = new UserService();
  }

  async create(req: Request<{}, {}, CreateCollectionDtoType>) {
    const { title } = req.body;

    const newCollection = await Collection.create({
      title,
      code: createUniqueSlug(title),
      owner: req.user.id,
    });

    await this.UserService.updateUserCollections({
      collectionId: newCollection.id,
      userId: newCollection.owner.toString(),
      operation: "Push",
    });

    return {
      data: newCollection,
      message: "Collection has been created successfully.",
      status: StatusCodes.CREATED,
    };
  }

  async update(
    req: Request<{ code: string }, {}, UpdateCollectionDtoType["data"]>
  ) {
    const data = req.body;
    const code = req.params.code;
    const foundCollection = await this.findOne({ code });

    const userId = req.user.id;
    if (!foundCollection || foundCollection.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }

    const updatedCollection = await Collection.findOneAndUpdate(
      { code },
      {
        ...data,
        ...(data.title ? { code: createUniqueSlug(data.title) } : {}),
        $currentDate: { updatedAt: true },
      },
      { new: true }
    );

    return {
      data: updatedCollection,
      message: "Collection has been updated successfully.",
      status: StatusCodes.OK,
    };
  }

  public async updateCollectionSnippets({
    collectionId,
    snippetId,
    operation,
  }: {
    collectionId: string;
    snippetId: string;
    operation: "Pull" | "Push";
  }) {
    const updatedCollection = await Collection.findOneAndUpdate(
      { id: collectionId },
      {
        ...(operation === "Push"
          ? { $addToSet: { snippets: snippetId } }
          : null),
        ...(operation === "Pull" ? { $pull: { snippets: snippetId } } : null),
      },
      { new: true }
    );

    return {
      data: updatedCollection,
      message: "collection snippets have been updated successfully.",
      status: StatusCodes.OK,
    };
  }

  async delete(req: Request<{ code: string }>) {
    const code = req.params.code;
    const foundCollection = await this.findOne({ code });
    const userId = req.user.id;
    if (!foundCollection || foundCollection.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }

    const deletedCollection = await Collection.findOneAndDelete({ code });

    await this.UserService.updateUserCollections({
      collectionId: deletedCollection.id,
      userId: deletedCollection.owner.toString(),
      operation: "Pull",
    });

    return {
      data: foundCollection,
      message: "Collection has been deleted successfully",
      status: StatusCodes.OK,
    };
  }

  private async findOne(by: { [key: string]: string }) {
    return await Collection.findOne(by).lean();
  }
}
