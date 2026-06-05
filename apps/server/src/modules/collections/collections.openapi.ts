import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import {
  BadRequestErrorResponseDto,
  CreateCollectionRequestDto,
  CreateCollectionSuccessResDto,
  DeleteCollectionRequestParamDto,
  DeleteCollectionSuccessResDto,
  DiscoverCollectionsRequestQueryDto,
  DiscoverCollectionsSuccessResDto,
  ForkCollectionRequestParamDto,
  ForkCollectionSuccessResDto,
  GetCollectionOwnerSuccessResDto,
  GetCollectionPublicSuccessResDto,
  GetCollectionRequestParamDto,
  GetUserCollectionsOwnerSuccessResDto,
  GetUserCollectionsPublicSuccessResDto,
  GetUserCollectionsRequestParamDto,
  GetUserCollectionsRequestQueryDto,
  InternalServerErrorResponseDto,
  MethodNotAllowedErrorResponseDto,
  NotFoundErrorResponseDto,
  protectedRouteHeadersSchema,
  RateLimiterErrorResponseDto,
  UnauthorizedErrorResponseDto,
  UpdateCollectionRequestBodyDto,
  UpdateCollectionRequestParamDto,
  UpdateCollectionSuccessResDto,
} from "@snippetly/common/dto";

export const createCollectionRouteConfig: RouteConfig = {
  method: "post",
  path: "/collections",
  summary: "Create collection endpoint",
  tags: ["Collections"],
  request: {
    body: {
      description: "Create collection request body",
      content: {
        "application/json": {
          schema: CreateCollectionRequestDto,
        },
      },
    },
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    201: {
      description: "Response body if the collection was created successfully",
      content: {
        "application/json": {
          schema: CreateCollectionSuccessResDto,
        },
      },
    },
    400: {
      description: "Response body if the request body was invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body if the session was invalid, or the access token was missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseDto,
        },
      },
    },
    404: {
      description: "Endpoint not found",
      content: {
        "application/json": {
          schema: NotFoundErrorResponseDto,
        },
      },
    },
    405: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: MethodNotAllowedErrorResponseDto,
        },
      },
    },
    429: {
      description: "Rate limiter response body",
      content: {
        "application/json": {
          schema: RateLimiterErrorResponseDto,
        },
      },
    },
  },
};

export const updateCollectionRouteConfig: RouteConfig = {
  method: "patch",
  path: "/collections/:slug",
  summary: "Update collection endpoint",
  tags: ["Collections"],
  request: {
    params: UpdateCollectionRequestParamDto,
    body: {
      description: "Update collection request body",
      content: {
        "application/json": {
          schema: UpdateCollectionRequestBodyDto,
        },
      },
    },
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Response body if the collection was updated successfully",
      content: {
        "application/json": {
          schema: UpdateCollectionSuccessResDto,
        },
      },
    },
    400: {
      description: "Response body if the request body or params were invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body if the session was invalid, or the access token was missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseDto,
        },
      },
    },
    404: {
      description: "Endpoint not found",
      content: {
        "application/json": {
          schema: NotFoundErrorResponseDto,
        },
      },
    },
    405: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: MethodNotAllowedErrorResponseDto,
        },
      },
    },
    429: {
      description: "Rate limiter response body",
      content: {
        "application/json": {
          schema: RateLimiterErrorResponseDto,
        },
      },
    },
  },
};

export const deleteCollectionRouteConfig: RouteConfig = {
  method: "delete",
  path: "/collections/:slug",
  summary: "Delete collection endpoint",
  tags: ["Collections"],
  request: {
    params: DeleteCollectionRequestParamDto,
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Response body if the collection was deleted successfully",
      content: {
        "application/json": {
          schema: DeleteCollectionSuccessResDto,
        },
      },
    },
    400: {
      description: "Response body if the request params were invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body if the session was invalid, or the access token was missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseDto,
        },
      },
    },
    404: {
      description: "Endpoint not found",
      content: {
        "application/json": {
          schema: NotFoundErrorResponseDto,
        },
      },
    },
    405: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: MethodNotAllowedErrorResponseDto,
        },
      },
    },
    429: {
      description: "Rate limiter response body",
      content: {
        "application/json": {
          schema: RateLimiterErrorResponseDto,
        },
      },
    },
  },
};

export const forkCollectionRouteConfig: RouteConfig = {
  method: "put",
  path: "/collections/:slug/fork",
  summary: "Fork collection endpoint",
  tags: ["Collections"],
  request: {
    params: ForkCollectionRequestParamDto,
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Response body if the collection was forked successfully",
      content: {
        "application/json": {
          schema: ForkCollectionSuccessResDto,
        },
      },
    },
    400: {
      description: "Response body if the request params were invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body if the session was invalid, or the access token was missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseDto,
        },
      },
    },
    404: {
      description: "Endpoint not found",
      content: {
        "application/json": {
          schema: NotFoundErrorResponseDto,
        },
      },
    },
    405: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: MethodNotAllowedErrorResponseDto,
        },
      },
    },
    429: {
      description: "Rate limiter response body",
      content: {
        "application/json": {
          schema: RateLimiterErrorResponseDto,
        },
      },
    },
  },
};

export const discoverCollectionsRouteConfig: RouteConfig = {
  method: "get",
  path: "/collections/discover",
  summary: "Discover collections endpoint",
  tags: ["Collections"],
  request: {
    query: DiscoverCollectionsRequestQueryDto,
    headers: protectedRouteHeadersSchema.partial(),
  },
  responses: {
    200: {
      description: "Response body if the collections were fetched successfully",
      content: {
        "application/json": {
          schema: DiscoverCollectionsSuccessResDto,
        },
      },
    },
    400: {
      description: "Response body if the request query params were invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseDto,
        },
      },
    },
    404: {
      description: "Endpoint not found",
      content: {
        "application/json": {
          schema: NotFoundErrorResponseDto,
        },
      },
    },
    405: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: MethodNotAllowedErrorResponseDto,
        },
      },
    },
    429: {
      description: "Rate limiter response body",
      content: {
        "application/json": {
          schema: RateLimiterErrorResponseDto,
        },
      },
    },
  },
};

export const getCollectionRouteConfig: RouteConfig = {
  method: "get",
  path: "/collections/:slug",
  summary: "Get collection endpoint",
  tags: ["Collections"],
  request: {
    params: GetCollectionRequestParamDto,
    headers: protectedRouteHeadersSchema.partial(),
  },
  responses: {
    200: {
      description: "Response body if the collection was fetched successfully",
      content: {
        "application/json": {
          schema: GetCollectionOwnerSuccessResDto.or(
            GetCollectionPublicSuccessResDto,
          ),
        },
      },
    },
    400: {
      description: "Response body if the request params were invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    404: {
      description: "Collection not found",
      content: {
        "application/json": {
          schema: NotFoundErrorResponseDto,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseDto,
        },
      },
    },
    405: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: MethodNotAllowedErrorResponseDto,
        },
      },
    },
    429: {
      description: "Rate limiter response body",
      content: {
        "application/json": {
          schema: RateLimiterErrorResponseDto,
        },
      },
    },
  },
};

export const getUserCollectionsRouteConfig: RouteConfig = {
  method: "get",
  path: "/collections/user/:creatorName",
  summary: "Get user collections endpoint",
  tags: ["Collections"],
  request: {
    params: GetUserCollectionsRequestParamDto,
    query: GetUserCollectionsRequestQueryDto,
    headers: protectedRouteHeadersSchema.partial(),
  },
  responses: {
    200: {
      description: "Response body if the collections were fetched successfully",
      content: {
        "application/json": {
          schema: GetUserCollectionsOwnerSuccessResDto.or(
            GetUserCollectionsPublicSuccessResDto,
          ),
        },
      },
    },
    400: {
      description:
        "Response body if the request params or query params were invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "User not found",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseDto,
        },
      },
    },
    404: {
      description: "Endpoint not found",
      content: {
        "application/json": {
          schema: NotFoundErrorResponseDto,
        },
      },
    },
    405: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: MethodNotAllowedErrorResponseDto,
        },
      },
    },
    429: {
      description: "Rate limiter response body",
      content: {
        "application/json": {
          schema: RateLimiterErrorResponseDto,
        },
      },
    },
  },
};

export const getCurrentUserCollectionsRouteConfig: RouteConfig = {
  method: "get",
  path: "/collections/current",
  summary: "Get current user collections endpoint",
  tags: ["Collections"],
  request: {
    query: GetUserCollectionsRequestQueryDto,
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Response body if the collections were fetched successfully",
      content: {
        "application/json": {
          schema: GetUserCollectionsOwnerSuccessResDto,
        },
      },
    },
    400: {
      description: "Response body if the request query params were invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body if the session was invalid, or the access token was missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: InternalServerErrorResponseDto,
        },
      },
    },
    404: {
      description: "Endpoint not found",
      content: {
        "application/json": {
          schema: NotFoundErrorResponseDto,
        },
      },
    },
    405: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: MethodNotAllowedErrorResponseDto,
        },
      },
    },
    429: {
      description: "Rate limiter response body",
      content: {
        "application/json": {
          schema: RateLimiterErrorResponseDto,
        },
      },
    },
  },
};
