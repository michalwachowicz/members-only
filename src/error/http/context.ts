import { Request } from "express";
import { SafeUser } from "../../types/user";

export interface BaseContext {
  requestId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userId?: number;
  username?: string;
}

export function getBaseContext(req: Request): BaseContext {
  const user = req.user as SafeUser | undefined;
  return {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: user?.id,
    username: user?.username,
  };
}
