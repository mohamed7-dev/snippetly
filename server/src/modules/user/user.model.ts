import { Schema, model } from "mongoose";
import { BaseModel } from "../../common/types/base-mongoose-model";
import { IFolder } from "../folder/folder.model";

export interface IUser extends BaseModel {
  name: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  acceptedPolicies: boolean;
  emailVerifiedAt: Date | null;
  refreshTokens: string[];
  emailVerificationToken: string | null;
  emailVerificationExpiresAt: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpiresAt: Date | null;
  folders: Schema.Types.ObjectId[];
  friendshipInbox: Schema.Types.ObjectId[];
  friendshipOutbox: Schema.Types.ObjectId[];
  friends: Schema.Types.ObjectId[];
}

export interface PopulatedUserDocument
  extends Omit<
    IUser,
    "friends" | "friendshipOutbox" | "friendshipInbox" | "folders"
  > {
  friends: IUser;
  friendshipOutbox: IUser;
  friendshipInbox: IUser;
  folders: IFolder;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    acceptedPolicies: { type: Boolean, default: false },
    refreshTokens: [String],
    emailVerifiedAt: Date,
    emailVerificationToken: String,
    emailVerificationExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    // RELATIONS
    folders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
    friendshipInbox: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendshipOutbox: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
