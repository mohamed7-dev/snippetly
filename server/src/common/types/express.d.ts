import { RequestContext } from "../middlewares/request-context-middleware.ts";
import { NonNullableFields } from "./utils.ts";

declare global {
  namespace Express {
    export interface Request {
      context: NonNullableFields<RequestContext>;
      validatedQuery: object;
    }
  }
}
