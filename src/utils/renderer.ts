import { Request, Response } from "express";

export default function render<T extends object>(
  view: string,
  res: Response,
  req?: Request,
  options?: T & { status?: number }
) {
  const { status, ...rest } = options || {};

  return res.status(status || 200).render(view, {
    isAuthenticated: req ? req.isAuthenticated() : false,
    user: req ? req.user : null,
    ...rest,
  });
}
