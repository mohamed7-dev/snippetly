import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);
// export this Zod instance and use it everywhere
export { z };

// Base Model
export const baseModelSchema = z.object({
  id: z.number().meta({ example: 1 }),
  createdAt: z.date().meta({ example: new Date(), format: "date-time" }),
  updatedAt: z.date().meta({ example: new Date(), format: "date-time" }),
});

// Password
const STRONG_PASSWORD_TITLE =
  "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";

export const STRONG_PASSWORD_SCHEMA = z
  .string()
  .min(12)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    { error: STRONG_PASSWORD_TITLE }
  );

export const LIMIT_SCHEMA = z
  .string()
  .transform((val) => Number(val))
  .refine((val) => val > 0 && val < 100)
  .optional();

// Base shapes
const BaseSuccess = z.object({
  status: z.number().int(),
  message: z.string(),
  type: z.literal("success"),
});

const BaseConflict = z.object({
  status: z.number().int(),
  message: z.string(),
  type: z.literal("conflict"),
});

const BaseError = z.object({
  type: z.literal("error"),
  status: z.number().int(),
  message: z.string(),
  cause: z.string().nullable(),
});

// Factory for success responses
export function createSuccessResponse<T extends z.ZodTypeAny>(
  dataSchema: T,
  id: string,
  description: string,
  dataExample: unknown,
  message?: string,
  status?: number
) {
  return BaseSuccess.extend({
    data: dataSchema,
  }).meta({
    id,
    description,
    example: {
      type: "success",
      status: status !== undefined ? status : 200,
      message: message ?? "Success",
      data: dataExample,
    },
  });
}

// Factory for conflict responses
export function createConflictResponse<T extends z.ZodTypeAny>(
  dataSchema: T,
  id: string,
  description: string,
  dataExample: unknown,
  message?: string
) {
  return BaseConflict.extend({
    data: dataSchema,
  }).meta({
    id,
    description,
    example: {
      type: "conflict",
      status: 409,
      message: message ?? "Conflict",
      data: dataExample,
    },
  });
}

// Factory for error responses
export function createErrorResponse() {
  return BaseError;
}

export const GlobalErrorResponseDto = createErrorResponse();

export const InternalServerErrorResponseDto = createErrorResponse().meta({
  id: "InternalServerErrorResponse",
  description: "Internal server error response body",
  example: {
    type: "error",
    status: 500,
    message: "Oops, Something went wrong.",
    cause: "error details",
  },
});

export const UnauthorizedErrorResponseDto = createErrorResponse().meta({
  id: "UnauthorizedErrorResponse",
  description: "Unauthorized error response body",
  example: {
    type: "error",
    status: 401,
    message: "Invalid session info",
    cause: null,
  },
});

export const ForbiddenErrorResponseDto = createErrorResponse().meta({
  id: "ForbiddenErrorResponse",
  description: "Forbidden error response body",
  example: {
    type: "error",
    status: 403,
    message: "Forbidden.",
    cause: null,
  },
});

export const BadRequestErrorResponseDto = createErrorResponse().meta({
  id: "BadRequestErrorResponse",
  description: "Bad request error response body",
  example: {
    type: "error",
    status: 400,
    message: "Bad request.",
    cause: "{{ZodError}}",
  },
});

export const NotFoundErrorResponseDto = createErrorResponse().meta({
  id: "NotFoundErrorResponse",
  description: "Not found error response body",
  example: {
    type: "error",
    status: 404,
    message: "Not found",
    cause: null,
  },
});
