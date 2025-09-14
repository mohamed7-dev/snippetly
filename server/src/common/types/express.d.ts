import { RequestContext } from "../middlewares/request-context-middleware";
import { NonNullableFields } from "./utils";

declare global {
  namespace Express {
    export interface Request {
      context: NonNullableFields<RequestContext>;
      validatedQuery: object;
    }
  }
}
