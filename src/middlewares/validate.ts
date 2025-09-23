import { NextFunction, Request, Response } from "express";
import { z, ZodError, ZodType } from "zod";
import { formatZodErrors } from "../utils/zod-formatter";

type OnErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  error: ZodError
) => unknown;

export const validateBody = <S extends ZodType>(
  schema: S,
  onError?: OnErrorHandler
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      if (onError) return onError(req, res, next, parsed.error);
      req.validationErrors = formatZodErrors(parsed.error);
      return next();
    }
    req.validatedBody = parsed.data as z.infer<S>;
    next();
  };
};

export default validateBody;
