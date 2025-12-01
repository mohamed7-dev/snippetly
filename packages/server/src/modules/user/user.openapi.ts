import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import {
  BadRequestErrorResponseDto,
  GetPublicUserSuccessResponseDto,
  GetUserSuccessResponseDto,
  InternalServerErrorResponseDto,
  protectedRouteHeadersSchema,
  UnauthorizedErrorResponseDto,
  UpdateUserRequestDto,
  UpdateUserSuccessResponseDto,
} from "@snippetly/common/dto";

export const updateUserRouteConfig: RouteConfig = {
  method: "put",
  path: "/users",
  summary: "Update currently logged-in user's info",
  tags: ["Users"],
  request: {
    body: {
      description: "Update user request body",
      content: {
        "application/json": {
          schema: UpdateUserRequestDto,
        },
      },
    },
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "User info updated successfully",
      content: {
        "application/json": {
          schema: UpdateUserSuccessResponseDto,
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

export const deleteUserRouteConfig: RouteConfig = {
  method: "delete",
  path: "/users",
  summary: "Delete currently logged-in user's account",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "User account deleted successfully",
      content: {
        "application/json": {
          schema: UpdateUserSuccessResponseDto,
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

export const getUserProfileRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/:name",
  summary: "Get user's profile info",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema.partial(),
  },
  responses: {
    200: {
      description: "User profile info tailored to the user asking for the data",
      content: {
        "application/json": {
          schema: GetUserSuccessResponseDto.or(GetPublicUserSuccessResponseDto),
        },
      },
    },
    400: {
      description: "Invalid param",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
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

export const getCurrentUserProfileRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current",
  summary: "Get logged-in user's profile info",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "User profile info tailored to the account owner",
      content: {
        "application/json": {
          schema: GetUserSuccessResponseDto,
        },
      },
    },
    401: {
      description:
        "Account is not found, or access token is missing or invalid",
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
