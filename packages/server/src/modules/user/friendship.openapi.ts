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
  protectedRouteHeadersSchema,
  RejectFriendshipRequestSuccessResDto,
  SendFriendshipRequestSuccessResDto,
  UnauthorizedErrorResponseDto,
} from "@snippetly/common/dto";

export const sendFriendshipRequestRouteConfig: RouteConfig = {
  method: "put",
  path: "/users/add-friend/:friend_name",
  summary: "Send friendship request",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    params: ManageFriendshipRequestParamDto,
  },
  responses: {
    200: {
      description: "Response body when the request is sent successfully",
      content: {
        "application/json": {
          schema: SendFriendshipRequestSuccessResDto,
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

export const acceptFriendshipRequestRouteConfig: RouteConfig = {
  method: "put",
  path: "/users/accept-friend/:friend_name",
  summary: "Accept friendship request",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    params: ManageFriendshipRequestParamDto,
  },
  responses: {
    200: {
      description: "Response body when the request is accepted successfully",
      content: {
        "application/json": {
          schema: AcceptFriendshipRequestSuccessResDto,
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

export const rejectFriendshipRequestRouteConfig: RouteConfig = {
  method: "put",
  path: "/users/reject-friend/:friend_name",
  summary: "Reject friendship request",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    params: ManageFriendshipRequestParamDto,
  },
  responses: {
    200: {
      description: "Response body when the request is rejected successfully",
      content: {
        "application/json": {
          schema: RejectFriendshipRequestSuccessResDto,
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

export const cancelFriendshipRequestRouteConfig: RouteConfig = {
  method: "put",
  path: "/users/cancel-friend/:friend_name",
  summary: "Cancel friendship request",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    params: ManageFriendshipRequestParamDto,
  },
  responses: {
    200: {
      description: "Response body when the request is cancelled successfully",
      content: {
        "application/json": {
          schema: CancelFriendshipRequestSuccessResDto,
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

export const getCurrentUserFriendsRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current/friends",
  summary: "Get current user friends",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    query: GetCurrentUserFriendsRequestQueryDto,
  },
  responses: {
    200: {
      description: "Response body when the request is successful",
      content: {
        "application/json": {
          schema: GetCurrentUserFriendsSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid query params",
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

export const getCurrentUserInboxRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current/inbox",
  summary: "Get friendship requests sent to the current user",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    query: GetCurrentUserFriendsRequestQueryDto,
  },
  responses: {
    200: {
      description: "Response body when the request is successful",
      content: {
        "application/json": {
          schema: GetCurrentUserInboxSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid query params",
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

export const getCurrentUserOutboxRouteConfig: RouteConfig = {
  method: "get",
  path: "/users/current/outbox",
  summary: "Get friendship requests sent by the current user",
  tags: ["Users"],
  request: {
    headers: protectedRouteHeadersSchema,
    query: GetCurrentUserFriendsRequestQueryDto,
  },
  responses: {
    200: {
      description: "Response body when the request is successful",
      content: {
        "application/json": {
          schema: GetCurrentUserOutboxSuccessResDto,
        },
      },
    },
    400: {
      description: "Invalid query params",
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
