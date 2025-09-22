import { ServerLogger } from "../logger/index.js";
import jwt from "jsonwebtoken";
import { ACCESS_JWTOKEN_SECRET } from "../../config/index.js";
function extractUserInfo(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    let userInfo = null;
    jwt.verify(token, ACCESS_JWTOKEN_SECRET, (err, user)=>{
        if (err) {
            userInfo = null;
        } else {
            userInfo = user;
        }
    });
    return userInfo;
}
export function requestContextMiddleware(req, _res, next) {
    const requestId = crypto.randomUUID();
    // in the controller, we know that protected routes can't reach
    // the point of accessing the user object without an error being thrown
    // in an earlier stage.
    // so it's safe to make it non nullable
    const user = extractUserInfo(req);
    req.context = {
        requestId,
        user,
        req,
        logger: ServerLogger
    };
    next();
}
