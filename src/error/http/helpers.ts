import { Request } from "express";
import { AppError } from "../app-error";
import { LogLevel } from "../../utils/logger";
import { getBaseContext } from "./context";

type ErrorOpts = { logTitle?: string; logLevel?: LogLevel };

function buildHttpError(
  title: string,
  defaultLevel: LogLevel,
  statusCode: number,
  message: string,
  req: Request,
  additionalContext?: Record<string, any>,
  options?: ErrorOpts
): AppError {
  const context = { ...getBaseContext(req), ...additionalContext };
  return new AppError(title, message, {
    logTitle: options?.logTitle || title,
    logLevel: options?.logLevel ?? defaultLevel,
    logContext: context,
    statusCode,
  });
}

const CONFIG = {
  badRequest: { title: "Bad Request", level: LogLevel.Warn, code: 400 },
  unauthorized: { title: "Unauthorized", level: LogLevel.Warn, code: 401 },
  forbidden: { title: "Forbidden", level: LogLevel.Warn, code: 403 },
  notFound: { title: "Not Found", level: LogLevel.Warn, code: 404 },
  conflict: { title: "Conflict", level: LogLevel.Warn, code: 409 },
  internalError: {
    title: "Internal Server Error",
    level: LogLevel.Error,
    code: 500,
  },
} as const;

type StandardKind = keyof typeof CONFIG;

function make(kind: StandardKind) {
  const cfg = CONFIG[kind];
  return (
    message: string,
    req: Request,
    additionalContext?: Record<string, any>,
    options?: ErrorOpts
  ) =>
    buildHttpError(
      cfg.title,
      cfg.level,
      cfg.code,
      message,
      req,
      additionalContext,
      options
    );
}

export const badRequest = make("badRequest");

export const unauthorized = make("unauthorized");

export const forbidden = make("forbidden");

export const notFound = make("notFound");

export const conflict = make("conflict");

export const internalError = make("internalError");

export function customError(
  title: string,
  message: string,
  statusCode: number,
  req: Request,
  additionalContext?: Record<string, any>,
  options?: ErrorOpts
): AppError {
  return buildHttpError(
    title,
    LogLevel.Error,
    statusCode,
    message,
    req,
    additionalContext,
    options
  );
}

export default {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
  customError,
};
