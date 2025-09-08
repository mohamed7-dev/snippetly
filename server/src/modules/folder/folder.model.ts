import { Schema, model } from "mongoose";
import { BaseModel } from "../../common/types/base-mongoose-model";
import { IUser } from "../user/user.model";
import { ISnippet } from "../snippet/snippet.model";

export interface IFolder extends BaseModel {
  title: string;
  code: string;
  description: string;
  color: string;
  isPrivate: boolean;
  allowForking: boolean;
  owner: Schema.Types.ObjectId;
  snippets: Schema.Types.ObjectId[];
  tags: Schema.Types.ObjectId[];
}

export interface FolderDocumentPopulated
  extends Omit<IFolder, "owner" | "snippets" | "tags"> {
  owner: IUser;
  snippets: ISnippet[];
}

const foldersSchema = new Schema<IFolder>(
  {
    title: { type: String, required: true, trim: true, index: true },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: { type: String, trim: true, index: true },
    color: { type: String, required: true, trim: true },
    isPrivate: { type: Boolean, default: false },
    allowForking: { type: Boolean, default: true },
    // RELATIONS
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    snippets: [{ type: Schema.Types.ObjectId, ref: "Snippet" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export const Folder = model("Folder", foldersSchema);
