import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import {
  BadRequestErrorResponseDto,
  InternalServerErrorResponseDto,
  LoginRequestDto,
  LoginSuccessResponseDto,
  LogoutSuccessResponseDto,
  protectedRouteCookiesSchema,
  protectedRouteHeadersSchema,
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
  summary: "Log in a user",
  tags: ["Auth"],
  request: {
    body: {
      description: "Login credentials",
      content: {
        "application/json": {
          schema: LoginRequestDto,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Authenticated successfully",
      content: {
        "application/json": {
          schema: LoginSuccessResponseDto,
        },
      },
    },
    401: {
      description: "User is not found, or the password is invalid",
      content: {
        "application/json": {
          schema: UnauthorizedErrorResponseDto,
        },
      },
    },
    400: {
      description: "Invalid credentials",
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

export const signupRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/signup",
  summary: "Create a new user account",
  tags: ["Auth"],
  request: {
    body: {
      required: true,
      description: "Signup credentials",
      content: {
        "application/json": {
          schema: SignupRequestDto,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created",
      content: {
        "application/json": {
          schema: SignupSuccessResponseDto,
        },
      },
    },
    409: {
      description: "User with same name already exists",
      content: {
        "application/json": {
          schema: SignupConflictResponseDto,
        },
      },
    },
    400: {
      description: "Invalid credentials",
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

export const logoutRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/logout",
  summary: "Logout and terminate session.",
  tags: ["Auth"],
  request: {
    cookies: protectedRouteCookiesSchema,
    headers: protectedRouteHeadersSchema,
  },
  responses: {
    200: {
      description: "Logged out successfully",
      content: {
        "application/json": {
          schema: LogoutSuccessResponseDto,
        },
      },
    },
    401: {
      description: "Session is not found or invalid.",
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

export const refreshTokenRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/refresh",
  summary: "Refresh access token using refresh token cookie.",
  tags: ["Auth"],
  request: {
    cookies: protectedRouteCookiesSchema,
  },
  responses: {
    200: {
      description: "Access token refreshed successfully.",
      content: {
        "application/json": {
          schema: RefreshTokenSuccessResponseDto,
        },
      },
    },
    401: {
      description:
        "Session is not found, invalid or the refresh-token cookie is missing.",
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

export const sendVEmailRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/send-verification-email",
  summary:
    "Verify user's email by sending them a link with a token that takes them to the verification route",
  tags: ["Auth"],
  request: {
    body: {
      description: "Send email verification link request body",
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
      description: "Verification link sent successfully",
      content: {
        "application/json": {
          schema: SendVEmailSuccessResponseDto,
        },
      },
    },
    400: {
      description: "Invalid credentials e.g. missing email",
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

export const verifyVEmailRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/verify-email-token",
  summary: "Verify token sent to the user's email.",
  tags: ["Auth"],
  request: {
    query: VerifyVTokenRequestDto,
  },
  responses: {
    200: {
      description:
        "Email verification token has been verified successfully, and the email is valid",
      content: {
        "application/json": {
          schema: VerifyVTokenSuccessResponseDto,
        },
      },
    },
    400: {
      description: "Invalid data e.g. missing token",
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

export const sendREmailRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/send-reset-email",
  summary:
    "Reset user's password by sending them a link with token to their email that takes them to the resetting route",
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
      description: "Password reset link has been sent successfully",
      content: {
        "application/json": {
          schema: SendRTokenSuccessResponseDto,
        },
      },
    },
    400: {
      description: "Invalid data e.g. missing token",
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

export const resetPasswordRouteConfig: RouteConfig = {
  method: "put",
  path: "/auth/reset-password",
  summary: "Verify password reset token sent to the user's email",
  tags: ["Auth"],
  request: {
    query: VerifyRTokenRequestQueryDto,
    body: {
      description: "ResetPasswordRequestBody",
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
        "Password reset token has been verified successfully, and the new password is saved",
      content: {
        "application/json": {
          schema: VerifyRTokenSuccessResponseDto,
        },
      },
    },
    400: {
      description: "Invalid data e.g. missing token or password",
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
