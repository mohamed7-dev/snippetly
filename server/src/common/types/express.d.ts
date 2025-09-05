import { IUser } from "../../modules/user/user.model";

declare global {
  namespace Express {
    export interface Request {
      user?: Pick<IUser, "id" | "name" | "email">;
    }
  }
}
