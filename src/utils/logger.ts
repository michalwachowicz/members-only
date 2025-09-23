export enum LogLevel {
  Info = "info",
  Warn = "warn",
  Error = "error",
  Debug = "debug",
}

export interface LogContext {
  userId?: number;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
  stack?: string;
  [key: string]: any;
}

function formatLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    service: "members-only",
    ...context,
  };

  if (process.env.NODE_ENV === "development") {
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${level.toUpperCase()}] [${timestamp}]: ${message}${contextStr}`;
  }

  return JSON.stringify(logEntry);
}

export function log(level: LogLevel, message: string, context?: LogContext) {
  const formattedLog = formatLogEntry(level, message, context);

  switch (level) {
    case LogLevel.Info:
      console.info(formattedLog);
      break;
    case LogLevel.Warn:
      console.warn(formattedLog);
      break;
    case LogLevel.Error:
      console.error(formattedLog);
      break;
    case LogLevel.Debug:
      console.debug(formattedLog);
      break;
    default:
      console.log(formattedLog);
  }
}

export const LOGGER = {
  info: (message: string, context?: LogContext) =>
    log(LogLevel.Info, message, context),
  warn: (message: string, context?: LogContext) =>
    log(LogLevel.Warn, message, context),
  error: (message: string, context?: LogContext) =>
    log(LogLevel.Error, message, context),
  debug: (message: string, context?: LogContext) =>
    log(LogLevel.Debug, message, context),
};
