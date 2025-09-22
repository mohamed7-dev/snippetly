import { StatusCodes } from "http-status-codes";
import { REFRESH_TOKEN_COOKIE_KEY } from "../../modules/auth/constants.js";
export function authMiddleware(req, res, next) {
    const user = req.context.user;
    if (!user || !req.cookies?.[REFRESH_TOKEN_COOKIE_KEY]) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Invalid session info, please login first."
        });
    }
    next();
}
