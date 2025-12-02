import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
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
