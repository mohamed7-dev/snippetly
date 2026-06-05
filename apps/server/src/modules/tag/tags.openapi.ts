import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import {
  GetPopularTagsSuccessResDto,
  InternalServerErrorResponseDto,
} from "@snippetly/common/dto";

export const getPopularTagsRouteConfig: RouteConfig = {
  method: "get",
  path: "/tags/popular",
  tags: ["tags"],
  summary: "Get popular tags",
  responses: {
    200: {
      description: "Get popular tags success response body",
      content: {
        "application/json": {
          schema: GetPopularTagsSuccessResDto,
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
