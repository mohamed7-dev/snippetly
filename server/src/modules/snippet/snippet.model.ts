import { Schema, model } from "mongoose";
import { BaseModel } from "../../common/types/base-mongoose-model";

interface ISnippet extends BaseModel {
  title: string;
  slug: string;
  description?: string;
  code: string;
  parseFormat: string;
  isPrivate: boolean;
  owner: Schema.Types.ObjectId;
  collection: Schema.Types.ObjectId;
  sharedWith: Schema.Types.ObjectId[];
}

const snippetSchema = new Schema<ISnippet>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    code: { type: String, required: true },
    parseFormat: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },

    // RELATIONS
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Snippet = model("Snippet", snippetSchema);
