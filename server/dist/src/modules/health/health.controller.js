import { StatusCodes } from "http-status-codes";
export class HealthController {
    check = async (_req, res)=>{
        try {
            res.status(StatusCodes.OK).json({
                status: "ok",
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: "error",
                message: "Database unavailable",
                timestamp: new Date().toISOString()
            });
        }
    };
}
