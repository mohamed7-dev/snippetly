import { model, Schema } from "mongoose";
import { BaseModel } from "../../common/types/base-mongoose-model";

export interface ITag extends BaseModel {
  name: string;
  description?: string | null;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, unique: true, required: true, index: true },
    description: String,
  },
  { timestamps: true }
);

export const Tag = model<ITag>("Tag", TagSchema);
