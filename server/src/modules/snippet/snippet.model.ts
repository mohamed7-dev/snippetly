import { Schema, model } from "mongoose";
import { BaseModel } from "../../common/types/base-mongoose-model";
import { IUser } from "../user/user.model";
import { IFolder } from "../folder/folder.model";

export interface ISnippet extends BaseModel {
  title: string;
  slug: string;
  description?: string;
  code: string;
  parseFormat: string;
  isPrivate: boolean;
  allowForking: boolean;
  owner: Schema.Types.ObjectId;
  folder: Schema.Types.ObjectId;
  sharedWith: Schema.Types.ObjectId[];
  tags: Schema.Types.ObjectId[];
}

export interface PopulatedSnippetDocument
  extends Omit<ISnippet, "owner" | "folder" | "tags" | "sharedWith"> {
  owner: IUser;
  folder: IFolder;
  sharedWith: IUser;
}

const snippetSchema = new Schema<ISnippet>(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, index: true },
    code: { type: String, required: true },
    parseFormat: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    allowForking: { type: Boolean, default: true },

    // RELATIONS
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

export const Snippet = model("Snippet", snippetSchema);
