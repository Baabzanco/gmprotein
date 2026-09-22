import { config } from "../config";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
}

class StructuredLogger {
  private levelWeights: Record<LogLevel, number> = {
    DEBUG: 10,
    INFO: 20,
    WARN: 30,
    ERROR: 40,
  };

  private minLevel: LogLevel = config.isProduction ? "INFO" : "DEBUG";

  private shouldLog(level: LogLevel): boolean {
    return this.levelWeights[level] >= this.levelWeights[this.minLevel];
  }

  private formatLog(level: LogLevel, message: string, data?: any, context?: string): LogPayload {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context ? { context } : {}),
      ...(data !== undefined ? { data } : {}),
    };
  }

  public debug(message: string, data?: any, context?: string): void {
    if (!this.shouldLog("DEBUG")) return;
    const payload = this.formatLog("DEBUG", message, data, context);
    console.debug(`[DEBUG] ${payload.timestamp} [${context || "System"}]: ${message}`, data ?? "");
  }

  public info(message: string, data?: any, context?: string): void {
    if (!this.shouldLog("INFO")) return;
    const payload = this.formatLog("INFO", message, data, context);
    console.info(`[INFO] ${payload.timestamp} [${context || "System"}]: ${message}`, data ?? "");
  }

  public warn(message: string, data?: any, context?: string): void {
    if (!this.shouldLog("WARN")) return;
    const payload = this.formatLog("WARN", message, data, context);
    console.warn(`[WARN] ${payload.timestamp} [${context || "System"}]: ${message}`, data ?? "");
  }

  public error(message: string, error?: any, context?: string): void {
    if (!this.shouldLog("ERROR")) return;
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            ...(config.isProduction ? {} : { stack: error.stack }),
          }
        : error;

    const payload = this.formatLog("ERROR", message, errorDetails, context);
    console.error(`[ERROR] ${payload.timestamp} [${context || "System"}]: ${message}`, errorDetails ?? "");
  }
}

export const logger = new StructuredLogger();
