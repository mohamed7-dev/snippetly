import { StatusCodes } from "http-status-codes";
import { HttpException } from "../../common/lib/exception";
import { User } from "../user/user.model";
import { Collection } from "./collection.model";
import { CreateCollectionDtoType } from "./dto/create-collection.dto";
import { UpdateCollectionDtoType } from "./dto/update-collection.dto";
import { DeleteCollectionDtoType } from "./dto/delete-collection.dto";
import { createUniqueSlug } from "../../common/lib/utils";

export class CollectionService {
  async create(input: CreateCollectionDtoType & { userId: string }) {
    const { title } = input;

    const newCollection = await Collection.create({
      ...input,
      code: createUniqueSlug(title),
      owner: input.userId,
    });

    await User.findOneAndUpdate(
      { id: newCollection.owner },
      {
        $addToSet: { collections: newCollection._id },
      },
      { new: true }
    );
    return newCollection;
  }

  async update(input: UpdateCollectionDtoType & { userId: string }) {
    const { code, data, userId } = input;
    const foundCollection = await this.findOne({ code });
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

    return updatedCollection;
  }

  async delete(input: DeleteCollectionDtoType & { userId: string }) {
    const { code, userId } = input;
    const foundCollection = await this.findOne({ code });
    if (!foundCollection || foundCollection.owner.toString() !== userId) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Collection not found.");
    }

    const deletedCollection = await Collection.findOneAndDelete({ code });

    const updatedUser = await User.findByIdAndUpdate(deletedCollection.owner, {
      $pull: { collections: deletedCollection._id },
    });

    return { foundCollection, updatedUser };
  }

  private async findOne(by: { [key: string]: string }) {
    return await Collection.findOne(by).lean();
  }
}
