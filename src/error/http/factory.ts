import { Request } from "express";
import { LogLevel } from "../../utils/logger";
import {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
  customError,
} from "./helpers";

export type FactoryOptions = {
  message: string;
  context?: Record<string, any>;
  logTitle?: string;
  logLevel?: LogLevel;
};

export function errorFor(req: Request) {
  return {
    badRequest: (options: FactoryOptions) =>
      badRequest(options.message, req, options.context, {
        logTitle: options.logTitle,
        logLevel: options.logLevel,
      }),
    unauthorized: (options: FactoryOptions) =>
      unauthorized(options.message, req, options.context, {
        logTitle: options.logTitle,
        logLevel: options.logLevel,
      }),
    forbidden: (options: FactoryOptions) =>
      forbidden(options.message, req, options.context, {
        logTitle: options.logTitle,
        logLevel: options.logLevel,
      }),
    notFound: (options: FactoryOptions) =>
      notFound(options.message, req, options.context, {
        logTitle: options.logTitle,
        logLevel: options.logLevel,
      }),
    conflict: (options: FactoryOptions) =>
      conflict(options.message, req, options.context, {
        logTitle: options.logTitle,
        logLevel: options.logLevel,
      }),
    internalError: (options: FactoryOptions) =>
      internalError(options.message, req, options.context, {
        logTitle: options.logTitle,
        logLevel: options.logLevel,
      }),
    custom: (title: string, statusCode: number, options: FactoryOptions) =>
      customError(title, options.message, statusCode, req, options.context, {
        logTitle: options.logTitle,
        logLevel: options.logLevel,
      }),
  };
}
