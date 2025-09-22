import { HttpException } from "./exception.js";
import { StatusCodes } from "http-status-codes";
import { CLIENTS_URLS } from "../../config/index.js";
export const allowedOrigins = [
    CLIENTS_URLS.react
];
export const corsOptions = {
    // NOTE: commented to test in production
    origin: (origin, callback)=>{
        if (origin && allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new HttpException(StatusCodes.FORBIDDEN, "Blocked by CORS."));
        }
    },
    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],
    optionsSuccessStatus: 200
};
