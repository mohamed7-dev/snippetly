import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import {
  BadRequestErrorResponseDto,
  DiscoverUsersRequestQueryDto,
  DiscoverUsersSuccessResponseDto,
  GetCurrentUserDashboardSuccessResDto,
  GetPublicUserSuccessResponseDto,
  GetUserSuccessResponseDto,
  InternalServerErrorResponseDto,
  MethodNotAllowedErrorResponseDto,
  NotFoundErrorResponseDto,
  protectedRouteCookiesSchema,
  protectedRouteHeadersSchema,
  RateLimiterErrorResponseDto,
  UnauthorizedErrorResponseDto,
  UpdateUserRequestDto,
  UpdateUserSuccessResponseDto,
} from "@snippetly/common/dto";

export const updateUserRouteConfig: RouteConfig = {
  method: "patch",
  path: "/users",
  summary: "Endpoint to update currently logged-in user info",
  tags: ["Users"],
  request: {
    body: {
      description: "Request body of the update user info endpoint",
      content: {
        "application/json": {
          schema: UpdateUserRequestDto,
        },
      },
    },
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
  },
  responses: {
    200: {
      description: "Response body if the update was successfully",
      content: {
        "application/json": {
          schema: UpdateUserSuccessResponseDto,
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
    400: {
      description: "Response body if the request body was invalid",
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

export const deleteUserRouteConfig: RouteConfig = {
  method: "delete",
  path: "/users",
  summary: "Endpoint to delete currently logged-in user's account",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
  },
  responses: {
    200: {
      description: "Response body id the user account was deleted successfully",
      content: {
        "application/json": {
          schema: UpdateUserSuccessResponseDto,
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

export const getUserProfileRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/:name",
  summary: "Endpoint to get user's profile",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema.partial(),
    cookies: protectedRouteCookiesSchema.partial(),
  },
  responses: {
    200: {
      description:
        "Response body if the user profile info was fetched successfully, customized for both visitor and owner users",
      content: {
        "application/json": {
          schema: GetUserSuccessResponseDto.or(GetPublicUserSuccessResponseDto),
        },
      },
    },
    400: {
      description: "Response body if the request params was invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "Response body if the user was not found",
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

export const getCurrentUserProfileRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current",
  summary: "Endpoint to get the currently logged-in user's profile info",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
  },
  responses: {
    200: {
      description:
        "Response body if the user profile info was fetched successfully",
      content: {
        "application/json": {
          schema: GetUserSuccessResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body if the session was not valid, or the access token was missing or invalid",
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

export const discoverUsersRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/discover",
  summary:
    "Endpoint to discover potential friends, and navigate through their snippets",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
    query: DiscoverUsersRequestQueryDto,
  },
  responses: {
    200: {
      description: "Response body if the request was successfully fulfilled",
      content: {
        "application/json": {
          schema: DiscoverUsersSuccessResponseDto,
        },
      },
    },
    400: {
      description: "Response body if the query params were invalid",
      content: {
        "application/json": {
          schema: BadRequestErrorResponseDto,
        },
      },
    },
    401: {
      description: "Response body if the session is missing",
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

export const getCurrentUserDashboardRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current/dashboard",
  summary: "Endpoint to get current user's dashboard specific info",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
  },
  responses: {
    200: {
      description: "Response body if the request was successfully fulfilled",
      content: {
        "application/json": {
          schema: GetCurrentUserDashboardSuccessResDto,
        },
      },
    },
    401: {
      description: "Response body if the session was invalid",
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
