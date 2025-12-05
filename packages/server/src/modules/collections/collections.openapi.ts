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
  protectedRouteHeadersSchema,
  UnauthorizedErrorResponseDto,
  UpdateCollectionRequestBodyDto,
  UpdateCollectionRequestParamDto,
  UpdateCollectionSuccessResDto,
} from "@snippetly/common/dto";

export const createCollectionRouteConfig: RouteConfig = {
  method: "post",
  path: "/collections",
  summary: "Create collection",
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
      description: "New collection response body",
      content: {
        "application/json": {
          schema: CreateCollectionSuccessResDto,
        },
      },
    },
    401: {
      description: "User is not found, or access token is missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
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

export const updateCollectionRouteConfig: RouteConfig = {
  method: "patch",
  path: "/collections/:slug",
  summary: "Update collection",
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
      description: "Updated collection success response body",
      content: {
        "application/json": {
          schema: UpdateCollectionSuccessResDto,
        },
      },
    },
    401: {
      description: "User is not found, or access token is missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    400: {
      description: "Invalid request body or param",
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

export const deleteCollectionRouteConfig: RouteConfig = {
  method: "delete",
  path: "/collections/:slug",
  summary: "Delete collection",
  tags: ["Collections"],
  request: {
    params: DeleteCollectionRequestParamDto,
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Deleted collection success response body",
      content: {
        "application/json": {
          schema: DeleteCollectionSuccessResDto,
        },
      },
    },
    401: {
      description: "User is not found, or access token is missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    400: {
      description: "Invalid request param",
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

export const forkCollectionRouteConfig: RouteConfig = {
  method: "put",
  path: "/collections/:slug/fork",
  summary: "Fork collection",
  tags: ["Collections"],
  request: {
    params: ForkCollectionRequestParamDto,
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Fork collection success response body",
      content: {
        "application/json": {
          schema: ForkCollectionSuccessResDto,
        },
      },
    },
    401: {
      description: "User is not found, or access token is missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    400: {
      description: "Invalid request param",
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

export const discoverCollectionsRouteConfig: RouteConfig = {
  method: "get",
  path: "/collections/discover",
  summary: "Discover collections",
  tags: ["Collections"],
  request: {
    query: DiscoverCollectionsRequestQueryDto,
    headers: protectedRouteHeadersSchema.partial(),
  },
  responses: {
    200: {
      description: "Discover collections success response body",
      content: {
        "application/json": {
          schema: DiscoverCollectionsSuccessResDto,
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

export const getCollectionRouteConfig: RouteConfig = {
  method: "get",
  path: "/collections/:slug",
  summary: "Get collection by slug",
  tags: ["Collections"],
  request: {
    params: GetCollectionRequestParamDto,
    headers: protectedRouteHeadersSchema.partial(),
  },
  responses: {
    200: {
      description: "Get collection success response body",
      content: {
        "application/json": {
          schema: GetCollectionOwnerSuccessResDto.or(
            GetCollectionPublicSuccessResDto
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

export const getUserCollectionsRouteConfig: RouteConfig = {
  method: "get",
  path: "/collections/user/:creatorName",
  summary: "Get user collections",
  tags: ["Collections"],
  request: {
    params: GetUserCollectionsRequestParamDto,
    query: GetUserCollectionsRequestQueryDto,
    headers: protectedRouteHeadersSchema.partial(),
  },
  responses: {
    200: {
      description: "Get user collections success response body",
      content: {
        "application/json": {
          schema: GetUserCollectionsOwnerSuccessResDto.or(
            GetUserCollectionsPublicSuccessResDto
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

export const getCurrentUserCollectionsRouteConfig: RouteConfig = {
  method: "get",
  path: "/collections/current",
  summary: "Get current user collections",
  tags: ["Collections"],
  request: {
    query: GetUserCollectionsRequestQueryDto,
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Get current user collections success response body",
      content: {
        "application/json": {
          schema: GetUserCollectionsOwnerSuccessResDto,
        },
      },
    },
    401: {
      description: "User is not found, or access token is missing or invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
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
