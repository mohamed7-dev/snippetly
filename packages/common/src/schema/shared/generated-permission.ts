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
}

export const permissionEnum = z.enum(Object.values(Permission));

export type PermissionKey = "Public" | "Authenticated" | "SuperAdmin" | "Owner" | "CreateSnippet" | "ReadSnippet" | "UpdateSnippet" | "DeleteSnippet" | "CreateCollection" | "ReadCollection" | "UpdateCollection" | "DeleteCollection";
