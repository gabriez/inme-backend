import type { Users } from "../database/entities/Users";

export interface IAuthorization {
  rolToCheck: string;
  user?: Users | null;
}
