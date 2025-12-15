import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import * as z from "zod";
import { $ZodErrorTree } from "zod/v4/core";

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

export const LIMIT_SCHEMA = z.number().min(1).max(100).optional();

// Base shapes
const BaseSuccess = z.object({
  status: z.literal(200),
  message: z.string(),
  type: z.literal("success"),
});

const BaseCreated = z.object({
  status: z.literal(201),
  message: z.string(),
  type: z.literal("success"),
});

const BaseConflict = z.object({
  status: z.literal(409),
  message: z.string(),
  type: z.literal("conflict"),
});

const BaseError = z.object({
  type: z.literal("error"),
  status: z.number().int(),
  message: z.string(),
  cause: z.any().nullable(),
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

// Factory for created responses
export function createCreatedResponse<T extends z.ZodTypeAny>(
  dataSchema: T,
  id: string,
  description: string,
  dataExample: unknown,
  message?: string
) {
  return BaseCreated.extend({
    data: dataSchema,
  }).meta({
    id,
    description,
    example: {
      type: "success",
      status: 201,
      message: message ?? "Created",
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

export const InternalServerErrorResponseDto = createErrorResponse()
  .extend({
    status: z.literal(500),
  })
  .meta({
    id: "InternalServerErrorResponse",
    description: "Internal server error response body",
    example: {
      type: "error",
      status: 500,
      message: "Oops, Something went wrong.",
      cause: "{{Cause}}",
    },
  });

export const UnauthorizedErrorResponseDto = createErrorResponse()
  .extend({
    status: z.literal(401),
    cause: z.null(),
  })
  .meta({
    id: "UnauthorizedErrorResponse",
    description: "Unauthorized error response body",
    example: {
      type: "error",
      status: 401,
      message: "UnAuthorized",
      cause: null,
    },
  });

export type UnAuthorizedErrorResponseDtoType = z.infer<
  typeof UnauthorizedErrorResponseDto
>;

export const ForbiddenErrorResponseDto = createErrorResponse()
  .extend({
    status: z.literal(403),
    cause: z.null(),
  })
  .meta({
    id: "ForbiddenErrorResponse",
    description: "Forbidden error response body",
    example: {
      type: "error",
      status: 403,
      message: "Forbidden",
      cause: null,
    },
  });

export const BadRequestErrorResponseDto = createErrorResponse()
  .extend({
    status: z.literal(400),
  })
  .meta({
    id: "BadRequestErrorResponse",
    description: "Bad request error response body",
    example: {
      type: "error",
      status: 400,
      message: "Bad request",
      cause: "{{ZodError}}",
    },
  });

export type BadRequestErrorResponseDtoType<T> = z.infer<
  typeof BadRequestErrorResponseDto
> & {
  cause: $ZodErrorTree<T>;
};

export const NotFoundErrorResponseDto = createErrorResponse()
  .extend({
    status: z.literal(404),
  })
  .meta({
    id: "NotFoundErrorResponse",
    description: "Not found error response body",
    example: {
      type: "error",
      status: 404,
      message: "Not found",
      cause: null,
    },
  });

export const MethodNotAllowedErrorResponseDto = createErrorResponse()
  .extend({
    status: z.literal(405),
  })
  .meta({
    id: "MethodNotAllowedErrorResponse",
    description: "Method not allowed error response body",
    example: {
      type: "error",
      status: 405,
      message: "Method not allowed",
      cause: {
        allowedMethods: ["get", "post", "patch", "delete"],
      },
    },
  });

export const RateLimiterErrorResponseDto = createErrorResponse()
  .extend({
    status: z.literal(429),
    cause: z.null(),
  })
  .meta({
    id: "RateLimiterErrorResponse",
    description: "Rate limiter error response body",
    example: {
      type: "error",
      status: 429,
      message: "Too Many Requests",
      cause: null,
    },
  });

export type RateLimiterErrorResponseDtoType = z.infer<
  typeof RateLimiterErrorResponseDto
>;

export type SharedErrorResDtoType =
  | z.infer<typeof MethodNotAllowedErrorResponseDto>
  | z.infer<typeof NotFoundErrorResponseDto>
  | z.infer<typeof InternalServerErrorResponseDto>;

export const SharedErrorResDto = [
  InternalServerErrorResponseDto,
  MethodNotAllowedErrorResponseDto,
  NotFoundErrorResponseDto,
];
