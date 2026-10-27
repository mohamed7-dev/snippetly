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
  CreateCollection = "CreateCollection",
  ReadCollection = "ReadCollection",
  UpdateCollection = "UpdateCollection",
  DeleteCollection = "DeleteCollection",
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
  CreateDeveloperPreference = "CreateDeveloperPreference",
  ReadDeveloperPreference = "ReadDeveloperPreference",
  UpdateDeveloperPreference = "UpdateDeveloperPreference",
  DeleteDeveloperPreference = "DeleteDeveloperPreference",
  CreateFavourite = "CreateFavourite",
  ReadFavourite = "ReadFavourite",
  UpdateFavourite = "UpdateFavourite",
  DeleteFavourite = "DeleteFavourite",
  CreatePushNotification = "CreatePushNotification",
  ReadPushNotification = "ReadPushNotification",
  UpdatePushNotification = "UpdatePushNotification",
  DeletePushNotification = "DeletePushNotification",
  CreateNotification = "CreateNotification",
  ReadNotification = "ReadNotification",
  UpdateNotification = "UpdateNotification",
  DeleteNotification = "DeleteNotification",
  CreateSession = "CreateSession",
  ReadSession = "ReadSession",
  UpdateSession = "UpdateSession",
  DeleteSession = "DeleteSession",
}

export const permissionEnum = z.enum(Object.values(Permission));

export type PermissionKey = "Public" | "Authenticated" | "SuperAdmin" | "Owner" | "CreateSnippet" | "ReadSnippet" | "UpdateSnippet" | "DeleteSnippet" | "CreateCollection" | "ReadCollection" | "UpdateCollection" | "DeleteCollection" | "CreateTag" | "ReadTag" | "UpdateTag" | "DeleteTag" | "CreateFriendship" | "ReadFriendship" | "UpdateFriendship" | "DeleteFriendship" | "CreateDeveloper" | "ReadDeveloper" | "UpdateDeveloper" | "DeleteDeveloper" | "CreateDeveloperPreference" | "ReadDeveloperPreference" | "UpdateDeveloperPreference" | "DeleteDeveloperPreference" | "CreateFavourite" | "ReadFavourite" | "UpdateFavourite" | "DeleteFavourite" | "CreatePushNotification" | "ReadPushNotification" | "UpdatePushNotification" | "DeletePushNotification" | "CreateNotification" | "ReadNotification" | "UpdateNotification" | "DeleteNotification" | "CreateSession" | "ReadSession" | "UpdateSession" | "DeleteSession";
