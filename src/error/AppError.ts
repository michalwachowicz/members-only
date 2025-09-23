import { LogContext, LogLevel } from "../utils/logger";

type AppErrorOptions = {
  logTitle?: string;
  logLevel?: LogLevel;
  logContext?: LogContext;
  statusCode?: number;
};

export class AppError extends Error {
  title: string;
  logTitle?: string;
  logLevel?: LogLevel;
  logContext?: LogContext;
  statusCode?: number;

  constructor(title: string, message: string, options?: AppErrorOptions) {
    super(message);
    this.title = title;

    this.logTitle = options?.logTitle;
    this.logLevel = options?.logLevel;
    this.logContext = options?.logContext;
    this.statusCode = options?.statusCode;
  }
}
