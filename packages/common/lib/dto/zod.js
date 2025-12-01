"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestErrorResponseDto = exports.ForbiddenErrorResponseDto = exports.UnauthorizedErrorResponseDto = exports.InternalServerErrorResponseDto = exports.GlobalErrorResponseDto = exports.LIMIT_SCHEMA = exports.STRONG_PASSWORD_SCHEMA = exports.baseModelSchema = exports.z = void 0;
exports.createSuccessResponse = createSuccessResponse;
exports.createConflictResponse = createConflictResponse;
exports.createErrorResponse = createErrorResponse;
var z = __importStar(require("zod"));
exports.z = z;
var zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(z);
// Base Model
exports.baseModelSchema = z.object({
    id: z.number().meta({ example: 1 }),
    createdAt: z.date().meta({ example: new Date(), format: "date-time" }),
    updatedAt: z.date().meta({ example: new Date(), format: "date-time" }),
});
// Password
var STRONG_PASSWORD_TITLE = "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
exports.STRONG_PASSWORD_SCHEMA = z
    .string()
    .min(12)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/, { error: STRONG_PASSWORD_TITLE });
exports.LIMIT_SCHEMA = z
    .string()
    .transform(function (val) { return Number(val); })
    .refine(function (val) { return val > 0 && val < 100; })
    .optional();
// Base shapes
var BaseSuccess = z.object({
    status: z.number().int(),
    message: z.string(),
    type: z.literal("success"),
});
var BaseConflict = z.object({
    status: z.number().int(),
    message: z.string(),
    type: z.literal("conflict"),
});
var BaseError = z.object({
    type: z.literal("error"),
    status: z.number().int(),
    message: z.string(),
    cause: z.string().nullable(),
});
// Factory for success responses
function createSuccessResponse(dataSchema, id, description, dataExample, message, status) {
    return BaseSuccess.extend({
        data: dataSchema,
    }).meta({
        id: id,
        description: description,
        example: {
            type: "success",
            status: status !== undefined ? status : 200,
            message: message !== null && message !== void 0 ? message : "Success",
            data: dataExample,
        },
    });
}
// Factory for conflict responses
function createConflictResponse(dataSchema, id, description, dataExample, message) {
    return BaseConflict.extend({
        data: dataSchema,
    }).meta({
        id: id,
        description: description,
        example: {
            type: "conflict",
            status: 409,
            message: message !== null && message !== void 0 ? message : "Conflict",
            data: dataExample,
        },
    });
}
// Factory for error responses
function createErrorResponse() {
    return BaseError;
}
exports.GlobalErrorResponseDto = createErrorResponse();
exports.InternalServerErrorResponseDto = createErrorResponse().meta({
    id: "InternalServerErrorResponse",
    description: "Internal server error response body",
    example: {
        type: "error",
        status: 500,
        message: "Oops, Something went wrong.",
        cause: "error details",
    },
});
exports.UnauthorizedErrorResponseDto = createErrorResponse().meta({
    id: "UnauthorizedErrorResponse",
    description: "Unauthorized error response body",
    example: {
        type: "error",
        status: 401,
        message: "Invalid session info",
        cause: null,
    },
});
exports.ForbiddenErrorResponseDto = createErrorResponse().meta({
    id: "ForbiddenErrorResponse",
    description: "Forbidden error response body",
    example: {
        type: "error",
        status: 403,
        message: "Forbidden.",
        cause: null,
    },
});
exports.BadRequestErrorResponseDto = createErrorResponse().meta({
    id: "BadRequestErrorResponse",
    description: "Bad request error response body",
    example: {
        type: "error",
        status: 400,
        message: "Bad request.",
        cause: "zod error",
    },
});
//# sourceMappingURL=zod.js.map