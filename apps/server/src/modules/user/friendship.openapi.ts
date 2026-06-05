import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import {
  AcceptFriendshipRequestSuccessResDto,
  BadRequestErrorResponseDto,
  CancelFriendshipRequestSuccessResDto,
  GetCurrentUserFriendsRequestQueryDto,
  GetCurrentUserFriendsSuccessResDto,
  GetCurrentUserInboxSuccessResDto,
  GetCurrentUserOutboxSuccessResDto,
  InternalServerErrorResponseDto,
  ManageFriendshipRequestParamDto,
  MethodNotAllowedErrorResponseDto,
  NotFoundErrorResponseDto,
  protectedRouteCookiesSchema,
  protectedRouteHeadersSchema,
  RateLimiterErrorResponseDto,
  RejectFriendshipRequestSuccessResDto,
  SendFriendshipRequestSuccessResDto,
  UnauthorizedErrorResponseDto,
} from "@snippetly/common/dto";

export const sendFriendshipRequestRouteConfig: RouteConfig = {
  method: "put",
  path: "/users/add-friend/:friend_name",
  summary: "Endpoint to send a friendship request",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
    params: ManageFriendshipRequestParamDto,
  },
  responses: {
    200: {
      description:
        "Response body if the friendship request was sent successfully",
      content: {
        "application/json": {
          schema: SendFriendshipRequestSuccessResDto,
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
      description: "Response body if the current session is missing or invalid",
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

export const acceptFriendshipRequestRouteConfig: RouteConfig = {
  method: "put",
  path: "/users/accept-friend/:friend_name",
  summary: "Endpoint to accept friendship request",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
    params: ManageFriendshipRequestParamDto,
  },
  responses: {
    200: {
      description:
        "Response body if the friendship request was accepted successfully",
      content: {
        "application/json": {
          schema: AcceptFriendshipRequestSuccessResDto,
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
      description: "Response body if the current session is missing or invalid",
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

export const rejectFriendshipRequestRouteConfig: RouteConfig = {
  method: "put",
  path: "/users/reject-friend/:friend_name",
  summary: "Endpoint to reject friendship request",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
    params: ManageFriendshipRequestParamDto,
  },
  responses: {
    200: {
      description:
        "Response body if the friendship request was rejected successfully",
      content: {
        "application/json": {
          schema: RejectFriendshipRequestSuccessResDto,
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
      description: "Response body if the current session is invalid or missing",
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

export const cancelFriendshipRequestRouteConfig: RouteConfig = {
  method: "put",
  path: "/users/cancel-friend/:friend_name",
  summary: "Endpoint to cancel friendship request",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
    params: ManageFriendshipRequestParamDto,
  },
  responses: {
    200: {
      description:
        "Response body if the friendship request was cancelled successfully",
      content: {
        "application/json": {
          schema: CancelFriendshipRequestSuccessResDto,
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
      description: "Response body if the current session is invalid or missing",
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

export const getCurrentUserFriendsRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current/friends",
  summary: "Endpoint to get the currently logged-in user's friends",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
    query: GetCurrentUserFriendsRequestQueryDto,
  },
  responses: {
    200: {
      description: "Response body if the request was successful",
      content: {
        "application/json": {
          schema: GetCurrentUserFriendsSuccessResDto,
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
      description: "Response body if the current session is invalid or missing",
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

export const getCurrentUserInboxRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current/inbox",
  summary: "Endpoint to get friendship requests was sent to the current user",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
    query: GetCurrentUserFriendsRequestQueryDto,
  },
  responses: {
    200: {
      description: "Response body if the request was successful",
      content: {
        "application/json": {
          schema: GetCurrentUserInboxSuccessResDto,
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
      description: "Response body if the current session is missing or invalid",
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

export const getCurrentUserOutboxRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current/outbox",
  summary: "Endpoint to get friendship requests was sent by the current user",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    cookies: protectedRouteCookiesSchema,
    query: GetCurrentUserFriendsRequestQueryDto,
  },
  responses: {
    200: {
      description: "Response body if the request was successful",
      content: {
        "application/json": {
          schema: GetCurrentUserOutboxSuccessResDto,
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
      description: "Response body if the current session is missing or invalid",
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
