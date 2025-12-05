import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import {
  BadRequestErrorResponseDto,
  CreateSnippetRequestDto,
  CreateSnippetSuccessResDto,
  DeleteSnippetSuccessResDto,
  DiscoverSnippetsRequestQueryDto,
  DiscoverSnippetsSuccessResDto,
  ForkSnippetRequestBodyDto,
  ForkSnippetRequestParamDto,
  ForkSnippetSuccessResDto,
  GetCollectionSnippetsRequestParamDto,
  GetCollectionSnippetsRequestQueryDto,
  GetCollectionSnippetsSuccessOwnerResDto,
  GetCollectionSnippetsSuccessPublicResDto,
  GetSnippetRequestParamDto,
  GetSnippetSuccessOwnerResDto,
  GetSnippetSuccessPublicResDto,
  GetUserFriendsSnippetsSuccessResDto,
  GetUserSnippetsRequestParamDto,
  GetUserSnippetsRequestQueryDto,
  GetUserSnippetsSuccessOwnerResDto,
  GetUserSnippetsSuccessPublicResDto,
  InternalServerErrorResponseDto,
  NotFoundErrorResponseDto,
  protectedRouteHeadersSchema,
  UnauthorizedErrorResponseDto,
  UpdateSnippetRequestBodyDto,
  UpdateSnippetRequestParamDto,
  UpdateSnippetSuccessResDto,
} from "@snippetly/common/dto";

export const createSnippetRouteConfig: RouteConfig = {
  path: "/snippets",
  method: "post",
  summary: "Create snippet endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema,
    body: {
      description: "Create snippet request body",
      content: {
        "application/json": {
          schema: CreateSnippetRequestDto,
        },
      },
    },
  },
  responses: {
    201: {
      description:
        "Create snippet endpoint response if the snippet was created successfully",
      content: {
        "application/json": {
          schema: CreateSnippetSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "User is not logged-in or the access token is invalid",
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
  },
};

export const updateSnippetRouteConfig: RouteConfig = {
  path: "/snippets/:slug",
  method: "patch",
  summary: "Update snippet endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema,
    params: UpdateSnippetRequestParamDto,
    body: {
      description: "Update snippet request body",
      content: {
        "application/json": {
          schema: UpdateSnippetRequestBodyDto,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Update snippet endpoint response if the snippet was updated successfully",
      content: {
        "application/json": {
          schema: UpdateSnippetSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid request body or params",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "User is not logged-in or the access token is invalid",
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
  },
};

export const deleteSnippetRouteConfig: RouteConfig = {
  path: "/snippets/:slug",
  method: "delete",
  summary: "Delete snippet endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema,
    params: UpdateSnippetRequestParamDto,
  },
  responses: {
    200: {
      description:
        "Delete snippet endpoint response if the snippet was deleted successfully",
      content: {
        "application/json": {
          schema: DeleteSnippetSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid request params",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "User is not logged-in or the access token is invalid",
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
  },
};

export const forkSnippetRouteConfig: RouteConfig = {
  path: "/snippets/:slug/fork",
  method: "put",
  summary: "Fork snippet endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema,
    params: ForkSnippetRequestParamDto,
    body: {
      description: "Fork snippet request body",
      content: {
        "application/json": {
          schema: ForkSnippetRequestBodyDto,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Delete snippet endpoint response if the snippet was forked successfully",
      content: {
        "application/json": {
          schema: ForkSnippetSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid request body or params",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "User is not logged-in or the access token is invalid",
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
  },
};

export const getSnippetRouteConfig: RouteConfig = {
  path: "/snippets/:slug",
  method: "get",
  summary: "Get snippet endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema.partial(),
    params: GetSnippetRequestParamDto,
  },
  responses: {
    200: {
      description:
        "Get snippet endpoint response if the snippet was fetched successfully",
      content: {
        "application/json": {
          schema: GetSnippetSuccessOwnerResDto.or(
            GetSnippetSuccessPublicResDto
          ),
        },
      },
    },
    400: {
      description: "Invalid request params",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    404: {
      description: "Snippet not found",
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
  },
};

export const getCollectionSnippetsRouteConfig: RouteConfig = {
  path: "/snippets/collection/:collection",
  method: "get",
  summary: "Get collection snippets endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema.partial(),
    params: GetCollectionSnippetsRequestParamDto,
    query: GetCollectionSnippetsRequestQueryDto,
  },
  responses: {
    200: {
      description:
        "Get collection snippets endpoint response if the snippets was fetched successfully",
      content: {
        "application/json": {
          schema: GetCollectionSnippetsSuccessOwnerResDto.or(
            GetCollectionSnippetsSuccessPublicResDto
          ),
        },
      },
    },
    400: {
      description: "Invalid request params or query params",
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
  },
};

export const discoverSnippetsRouteConfig: RouteConfig = {
  path: "/snippets/discover",
  method: "get",
  summary: "Discover snippets endpoint",
  tags: ["Snippets"],
  request: {
    query: DiscoverSnippetsRequestQueryDto,
  },
  responses: {
    200: {
      description:
        "Discover snippets endpoint response if the snippets was fetched successfully",
      content: {
        "application/json": {
          schema: DiscoverSnippetsSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid request query params",
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
  },
};

export const getUserSnippetsRouteConfig: RouteConfig = {
  path: "/snippets/user/:creatorName",
  method: "get",
  summary: "Get user snippets endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema.partial(),
    params: GetUserSnippetsRequestParamDto,
    query: GetUserSnippetsRequestQueryDto,
  },
  responses: {
    200: {
      description:
        "Get user snippets endpoint response if the snippets was fetched successfully",
      content: {
        "application/json": {
          schema: GetUserSnippetsSuccessOwnerResDto.or(
            GetUserSnippetsSuccessPublicResDto
          ),
        },
      },
    },
    400: {
      description: "Invalid request params or query params",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "User is not found",
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
  },
};

export const getCurrentUserSnippetsRouteConfig: RouteConfig = {
  path: "/snippets/user/current",
  method: "get",
  summary: "Get current user's snippets endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema,
    query: GetUserSnippetsRequestQueryDto,
  },
  responses: {
    200: {
      description:
        "Get current user snippets endpoint response if the snippets was fetched successfully",
      content: {
        "application/json": {
          schema: GetUserSnippetsSuccessOwnerResDto,
        },
      },
    },
    400: {
      description: "Invalid request query params",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description:
        "User is not logged-in or the access token is missing or invalid",
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
  },
};

export const getUserFriendsSnippetsRouteConfig: RouteConfig = {
  path: "/snippets/user/:name/friends",
  method: "get",
  summary: "Get user fiends' snippets endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema.partial(),
    params: GetUserSnippetsRequestParamDto,
    query: GetUserSnippetsRequestQueryDto,
  },
  responses: {
    200: {
      description:
        "Get user friends' snippets endpoint response if the snippets was fetched successfully",
      content: {
        "application/json": {
          schema: GetUserFriendsSnippetsSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid request query params or params",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "User is not found",
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
  },
};

export const getCurrentUserFriendsSnippetsRouteConfig: RouteConfig = {
  path: "/snippets/user/current/friends",
  method: "get",
  summary: "Get current user fiends' snippets endpoint",
  tags: ["Snippets"],
  request: {
    headers: protectedRouteHeadersSchema,
    query: GetUserSnippetsRequestQueryDto,
  },
  responses: {
    200: {
      description:
        "Get current user friends' snippets endpoint response if the snippets was fetched successfully",
      content: {
        "application/json": {
          schema: GetUserFriendsSnippetsSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid request query params",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description:
        "User is not logged-in or the access token is missing or invalid",
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
  },
};
