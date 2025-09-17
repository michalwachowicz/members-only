enum LogLevel {
  Info = "info",
  Warn = "warn",
  Error = "error",
  Debug = "debug",
}

function log(level: LogLevel, message: string) {
  const timestamp = new Date().toISOString();
  switch (level) {
    case LogLevel.Info:
      console.info(`[INFO] [${timestamp}]: ${message}`);
      break;
    case LogLevel.Warn:
      console.warn(`[WARN] [${timestamp}]: ${message}`);
      break;
    case LogLevel.Error:
      console.error(`[ERROR] [${timestamp}]: ${message}`);
      break;
    case LogLevel.Debug:
      console.debug(`[DEBUG] [${timestamp}]: ${message}`);
      break;
    default:
      console.log(`[LOG] [${timestamp}]: ${message}`);
  }
}

export const LOGGER = {
  info: (message: string) => log(LogLevel.Info, message),
  warn: (message: string) => log(LogLevel.Warn, message),
  error: (message: string) => log(LogLevel.Error, message),
  debug: (message: string) => log(LogLevel.Debug, message),
};
