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
}

export const permissionEnumDto = z.enum(Object.values(Permission));

export type PermissionKey = "Public" | "Authenticated" | "SuperAdmin" | "Owner";
