import { StatusCodes } from "http-status-codes";
import { MulterError } from "multer";
export function multerErrorMiddleware(error, _req, res, next) {
    if (error instanceof MulterError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: error.message
        });
    }
    next(error);
}
