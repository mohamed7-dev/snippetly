import { RootFilterQuery } from "mongoose";
import { ValueOrElement } from "../../common/types/utils";
import { ITag, Tag } from "./tag.model";

export class TagService {
  async ensureTagsExistence(tags: string[]) {
    return await Promise.all(
      tags.map(async (tagName: string) => {
        return Tag.findOneAndUpdate(
          { name: tagName.toLowerCase() },
          { name: tagName.toLowerCase() },
          { new: true, upsert: true }
        );
      })
    );
  }

  async findTagsQueryBuilder(filter: RootFilterQuery<ITag>) {
    return Tag.find(filter);
  }
}
