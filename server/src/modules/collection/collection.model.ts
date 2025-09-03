import { Schema, model } from "mongoose";
import { BaseModel } from "../../common/types/base-mongoose-model";

interface ICollection extends BaseModel {
  title: string;
  code: string;
  owner: Schema.Types.ObjectId;
  snippets: Schema.Types.ObjectId[];
}

const collectionSchema = new Schema<ICollection>(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    // RELATIONS
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    snippets: [{ type: Schema.Types.ObjectId, ref: "Snippet" }],
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export const Collection = model("Collection", collectionSchema);
