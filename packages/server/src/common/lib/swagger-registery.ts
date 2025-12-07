/* eslint-disable no-var */
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  RouteConfig,
} from "@asteasolutions/zod-to-openapi";
import {
  loginRouteConfig,
  logoutRouteConfig,
  refreshTokenRouteConfig,
  resetPasswordRouteConfig,
  sendREmailRouteConfig,
  sendVEmailRouteConfig,
  signupRouteConfig,
  verifyVEmailRouteConfig,
} from "../../modules/auth/auth.openapi";
import {
  deleteUserRouteConfig,
  discoverUsersRouteConfig,
  getCurrentUserDashboardRouteConfig,
  getCurrentUserProfileRouteConfig,
  getUserProfileRouteConfig,
  updateUserRouteConfig,
} from "../../modules/user/user.openapi";

import {
  InternalServerErrorResponseDto,
  MethodNotAllowedErrorResponseDto,
  NotFoundErrorResponseDto,
  RateLimiterErrorResponseDto,
} from "@snippetly/common/dto";
import {
  createCollectionRouteConfig,
  deleteCollectionRouteConfig,
  discoverCollectionsRouteConfig,
  forkCollectionRouteConfig,
  getCollectionRouteConfig,
  getCurrentUserCollectionsRouteConfig,
  getUserCollectionsRouteConfig,
  updateCollectionRouteConfig,
} from "../../modules/collections/collections.openapi";
import {
  createSnippetRouteConfig,
  deleteSnippetRouteConfig,
  discoverSnippetsRouteConfig,
  forkSnippetRouteConfig,
  getCollectionSnippetsRouteConfig,
  getSnippetRouteConfig,
  updateSnippetRouteConfig,
} from "../../modules/snippet/snippet.openapi";
import { getPopularTagsRouteConfig } from "../../modules/tag/tags.openapi";
import {
  acceptFriendshipRequestRouteConfig,
  cancelFriendshipRequestRouteConfig,
  getCurrentUserFriendsRouteConfig,
  getCurrentUserInboxRouteConfig,
  getCurrentUserOutboxRouteConfig,
  rejectFriendshipRequestRouteConfig,
  sendFriendshipRequestRouteConfig,
} from "../../modules/user/friendship.openapi";

export var sharedResRouteConfig: RouteConfig["responses"] = {
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
};

export var rateLimiterResRouteConfig: RouteConfig["responses"] = {
  429: {
    description: "Rate limiter response body",
    content: {
      "application/json": {
        schema: RateLimiterErrorResponseDto,
      },
    },
  },
};

const registry = new OpenAPIRegistry();

registry.registerPath(loginRouteConfig);
registry.registerPath(signupRouteConfig);
registry.registerPath(logoutRouteConfig);
registry.registerPath(refreshTokenRouteConfig);
registry.registerPath(sendVEmailRouteConfig);
registry.registerPath(verifyVEmailRouteConfig);
registry.registerPath(sendREmailRouteConfig);
registry.registerPath(resetPasswordRouteConfig);

registry.registerPath(updateUserRouteConfig);
registry.registerPath(deleteUserRouteConfig);
registry.registerPath(getUserProfileRouteConfig);
registry.registerPath(getCurrentUserProfileRouteConfig);
registry.registerPath(discoverUsersRouteConfig);
registry.registerPath(getCurrentUserDashboardRouteConfig);

registry.registerPath(sendFriendshipRequestRouteConfig);
registry.registerPath(acceptFriendshipRequestRouteConfig);
registry.registerPath(rejectFriendshipRequestRouteConfig);
registry.registerPath(cancelFriendshipRequestRouteConfig);
registry.registerPath(getCurrentUserFriendsRouteConfig);
registry.registerPath(getCurrentUserInboxRouteConfig);
registry.registerPath(getCurrentUserOutboxRouteConfig);

registry.registerPath(createCollectionRouteConfig);
registry.registerPath(updateCollectionRouteConfig);
registry.registerPath(deleteCollectionRouteConfig);
registry.registerPath(forkCollectionRouteConfig);
registry.registerPath(getCollectionRouteConfig);
registry.registerPath(getUserCollectionsRouteConfig);
registry.registerPath(getCurrentUserCollectionsRouteConfig);
registry.registerPath(discoverCollectionsRouteConfig);

registry.registerPath(createSnippetRouteConfig);
registry.registerPath(updateSnippetRouteConfig);
registry.registerPath(deleteSnippetRouteConfig);
registry.registerPath(forkSnippetRouteConfig);
registry.registerPath(discoverSnippetsRouteConfig);
registry.registerPath(getSnippetRouteConfig);
registry.registerPath(getCollectionSnippetsRouteConfig);

// registry.registerPath(getUserSnippetsRouteConfig);
// registry.registerPath(getCurrentUserSnippetsRouteConfig);
// registry.registerPath(getUserFriendsSnippetsRouteConfig);
// registry.registerPath(getCurrentUserFriendsSnippetsRouteConfig);

registry.registerPath(getPopularTagsRouteConfig);

// Base document
const generator = new OpenApiGeneratorV31(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "Snippetly API",
    version: "1.0.0",
    description: "Snippetly REST API documentation",
  },
  servers: [
    {
      url: "http://localhost:3010/api/v1",
      description: "Local dev",
    },
  ],
});
