import {
  JWT_REFRESH_EXPIRES,
  JWT_REFRESH_REMEMBER_EXPIRES,
  NODE_ENV,
} from "../../config";

export const isDevelopment = NODE_ENV === "development";
export const isProduction = NODE_ENV === "production";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD") // split accented characters into base + diacritics
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .trim() // remove leading/trailing spaces
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

export function generateUniquePrefix(): string {
  const random = Math.random().toString(36).substring(2, 6);
  const timestamp = Date.now().toString(36);
  return `${timestamp}${random}`;
}

export function handleCursorPagination<T extends Array<object>>({
  data,
  limit,
}: {
  data: T;
  limit: number;
}) {
  const hasMore = data.length > limit;
  // Remove the last item if there is more data
  const items = hasMore ? data.slice(0, -1) : data;
  // Set the next cursor to the last item if there is more data
  const lastItem = items[items.length - 1];
  const nextCursor = hasMore ? lastItem : null;

  return { nextCursor, data: items } as {
    nextCursor: T[number] | null;
    data: T;
  };
}

export function getRefreshTokenExpires(rememberMe: boolean) {
  return rememberMe ? JWT_REFRESH_REMEMBER_EXPIRES : JWT_REFRESH_EXPIRES;
}
