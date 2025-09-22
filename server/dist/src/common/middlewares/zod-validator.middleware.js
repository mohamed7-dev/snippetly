import { StatusCodes } from "http-status-codes";
import z, { ZodError } from "zod";
export function zodValidatorMiddleware(schema, dataSource) {
    return (req, res, next)=>{
        try {
            switch(dataSource){
                case "Body":
                    req.body = schema.parse(req.body);
                    break;
                case "Params":
                    req.params = schema.parse(req.params);
                    break;
                case "Query":
                    req.validatedQuery = schema.parse(req.query);
                    break;
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorTree = z.treeifyError(error);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Bad Request: invalid input data.",
                    cause: errorTree
                });
            }
            next(error);
        }
    };
}
