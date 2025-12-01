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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedRouteHeadersSchema = exports.protectedRouteCookiesSchema = void 0;
__exportStar(require("./signup.dto"), exports);
__exportStar(require("./login.dto"), exports);
__exportStar(require("./logout.dto"), exports);
__exportStar(require("./refresh-token.dto"), exports);
__exportStar(require("./send-r-token.dto"), exports);
__exportStar(require("./send-v-token.dto"), exports);
__exportStar(require("./verify-v-token.dto"), exports);
__exportStar(require("./verify-r-token.dto"), exports);
__exportStar(require("./verify-r-token.dto"), exports);
var common_1 = require("./common");
Object.defineProperty(exports, "protectedRouteCookiesSchema", { enumerable: true, get: function () { return common_1.protectedRouteCookiesSchema; } });
Object.defineProperty(exports, "protectedRouteHeadersSchema", { enumerable: true, get: function () { return common_1.protectedRouteHeadersSchema; } });
//# sourceMappingURL=index.js.map