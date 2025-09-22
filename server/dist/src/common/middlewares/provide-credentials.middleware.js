import { allowedOrigins } from "../lib/cors.js";
export function provideCredentialsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Credentials", "true");
    }
    next();
}
