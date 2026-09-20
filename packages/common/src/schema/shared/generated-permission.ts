/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */
import {z} from "zod"

export enum Permission {
  Public = "Public",
  Authenticated = "Authenticated",
  SuperAdmin = "SuperAdmin",
  Owner = "Owner",
  CreateSnippet = "CreateSnippet",
  ReadSnippet = "ReadSnippet",
  UpdateSnippet = "UpdateSnippet",
  DeleteSnippet = "DeleteSnippet",
  ForkSnippet = "ForkSnippet",
  CreateCollection = "CreateCollection",
  ReadCollection = "ReadCollection",
  UpdateCollection = "UpdateCollection",
  DeleteCollection = "DeleteCollection",
  ForkCollection = "ForkCollection",
  CreateTag = "CreateTag",
  ReadTag = "ReadTag",
  UpdateTag = "UpdateTag",
  DeleteTag = "DeleteTag",
  CreateFriendship = "CreateFriendship",
  ReadFriendship = "ReadFriendship",
  UpdateFriendship = "UpdateFriendship",
  DeleteFriendship = "DeleteFriendship",
  CreateDeveloper = "CreateDeveloper",
  ReadDeveloper = "ReadDeveloper",
  UpdateDeveloper = "UpdateDeveloper",
  DeleteDeveloper = "DeleteDeveloper",
}

export const permissionEnum = z.enum(Object.values(Permission));

export type PermissionKey = "Public" | "Authenticated" | "SuperAdmin" | "Owner" | "CreateSnippet" | "ReadSnippet" | "UpdateSnippet" | "DeleteSnippet" | "ForkSnippet" | "CreateCollection" | "ReadCollection" | "UpdateCollection" | "DeleteCollection" | "ForkCollection" | "CreateTag" | "ReadTag" | "UpdateTag" | "DeleteTag" | "CreateFriendship" | "ReadFriendship" | "UpdateFriendship" | "DeleteFriendship" | "CreateDeveloper" | "ReadDeveloper" | "UpdateDeveloper" | "DeleteDeveloper";
