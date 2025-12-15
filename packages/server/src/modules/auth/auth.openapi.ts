import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import {
  BadRequestErrorResponseDto,
  InternalServerErrorResponseDto,
  LoginRequestDto,
  LoginSuccessResponseDto,
  LogoutSuccessResponseDto,
  MethodNotAllowedErrorResponseDto,
  NotFoundErrorResponseDto,
  protectedRouteCookiesSchema,
  protectedRouteHeadersSchema,
  RateLimiterErrorResponseDto,
  RefreshTokenSuccessResponseDto,
  SendRTokenRequestDto,
  SendRTokenSuccessResponseDto,
  SendVEmailRequestDto,
  SendVEmailSuccessResponseDto,
  SignupConflictResponseDto,
  SignupRequestDto,
  SignupSuccessResponseDto,
  UnauthorizedErrorResponseDto,
  VerifyRTokenRequestBodyDto,
  VerifyRTokenRequestQueryDto,
  VerifyRTokenSuccessResponseDto,
  VerifyVTokenRequestDto,
  VerifyVTokenSuccessResponseDto,
} from "@snippetly/common/dto";

export const loginRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/login",
  summary: "Endpoint to authenticate user",
  tags: ["Auth"],
  request: {
    body: {
      description: "Request body of the login endpoint",
      content: {
        "application/json": {
          schema: LoginRequestDto,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Response body if the authentication was successful",
      content: {
        "application/json": {
          schema: LoginSuccessResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body if user was not found, or the password was invalid",
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

export const signupRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/signup",
  summary: "Endpoint to create a new user account",
  tags: ["Auth"],
  request: {
    body: {
      required: true,
      description: "Request body of the signup endpoint",
      content: {
        "application/json": {
          schema: SignupRequestDto,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Response body if the user was created successfully",
      content: {
        "application/json": {
          schema: SignupSuccessResponseDto,
        },
      },
    },
    409: {
      description: "Response body if a user with same name exists",
      content: {
        "application/json": {
          schema: SignupConflictResponseDto,
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

export const logoutRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/logout",
  summary: "Endpoint to logout and terminate session",
  tags: ["Auth"],
  request: {
    cookies: protectedRouteCookiesSchema,
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Response body if the session was terminated successfully",
      content: {
        "application/json": {
          schema: LogoutSuccessResponseDto,
        },
      },
    },
    401: {
      description: "Response body if the session was missing or invalid",
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
  },
};

export const refreshTokenRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/refresh",
  summary: "Endpoint to refresh access token",
  tags: ["Auth"],
  request: {
    cookies: protectedRouteCookiesSchema,
  },
  responses: {
    200: {
      description:
        "Response body if the access token was refreshed successfully",
      content: {
        "application/json": {
          schema: RefreshTokenSuccessResponseDto,
        },
      },
    },
    401: {
      description: "Response body if the refresh-token cookie is missing",
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

export const sendVEmailRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/send-verification-email",
  summary: "Endpoint to verify user's email",
  tags: ["Auth"],
  request: {
    body: {
      description: "Request body of the send email verification link endpoint",
      required: true,
      content: {
        "application/json": {
          schema: SendVEmailRequestDto,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Response body if verification link was sent successfully",
      content: {
        "application/json": {
          schema: SendVEmailSuccessResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body user account associated with the email is not found.",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    400: {
      description:
        "Response body if request body was invalid e.g. missing email",
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

export const verifyVEmailRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/verify-email-token",
  summary:
    "Endpoint to verify the email verification token that was sent to the user's email",
  tags: ["Auth"],
  request: {
    query: VerifyVTokenRequestDto,
  },
  responses: {
    200: {
      description:
        "Response body if email verification token was verified successfully",
      content: {
        "application/json": {
          schema: VerifyVTokenSuccessResponseDto,
        },
      },
    },
    401: {
      description: "Response body if token was invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    400: {
      description: "Response body if request query params was invalid",
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

export const sendREmailRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/send-reset-email",
  summary: "Endpoint to send password reset token to the user's verified email",
  tags: ["Auth"],
  request: {
    body: {
      description: "Send password reset link request body",
      required: true,
      content: {
        "application/json": {
          schema: SendRTokenRequestDto,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Response body if the password reset link was sent successfully",
      content: {
        "application/json": {
          schema: SendRTokenSuccessResponseDto,
        },
      },
    },
    401: {
      description:
        "Response body if the user account associated with the email is not found",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    400: {
      description:
        "Response body if request body was invalid e.g. missing email",
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

export const resetPasswordRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/reset-password",
  summary:
    "Endpoint to verify the password reset token that was sent to the user's email",
  tags: ["Auth"],
  request: {
    query: VerifyRTokenRequestQueryDto,
    body: {
      description: "Request body of the reset password endpoint",
      required: true,
      content: {
        "application/json": {
          schema: VerifyRTokenRequestBodyDto,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Response body if the password reset token was verified successfully",
      content: {
        "application/json": {
          schema: VerifyRTokenSuccessResponseDto,
        },
      },
    },
    401: {
      description: "Response body if the token is invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    400: {
      description:
        "Response body if the request body or query params are invalid e.g. missing token or password",
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
