import { Schema, model } from "mongoose";
import { BaseModel } from "../../common/types/base-mongoose-model";

export interface IUser extends BaseModel {
  name: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  collections: Schema.Types.ObjectId[];
  friendshipInbox: Schema.Types.ObjectId[];
  friendshipOutbox: Schema.Types.ObjectId[];
  friends: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // RELATIONS
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    friendshipInbox: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendshipOutbox: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
