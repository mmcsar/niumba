// Niumba - Log Helper
// Utility to replace console.log with structured logging
// Use this instead of console.log for better production behavior

import { logger } from '../services/loggerService';

/**
 * Development-only log (replaces console.log)
 * Automatically disabled in production
 */
export const devLog = (message: string, ...args: any[]): void => {
  if (__DEV__) {
    logger.debug(message, { args });
  }
};

/**
 * Info log (replaces console.log for important info)
 * Can be enabled/disabled via log level
 */
export const infoLog = (message: string, context?: Record<string, any>): void => {
  logger.info(message, context);
};

/**
 * Warning log (replaces console.warn)
 */
export const warnLog = (message: string, context?: Record<string, any>, error?: Error): void => {
  logger.warn(message, context, error);
};

/**
 * Error log (replaces console.error)
 */
export const errorLog = (message: string, error?: Error, context?: Record<string, any>): void => {
  logger.error(message, error, context);
};

/**
 * Performance log
 */
export const perfLog = (operation: string, duration: number, context?: Record<string, any>): void => {
  logger.performance(operation, duration, context);
};

/**
 * API call log
 */
export const apiLog = (
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number,
  error?: Error
): void => {
  logger.apiCall(method, endpoint, statusCode, duration, error);
};

// Export default for convenience
export default {
  devLog,
  infoLog,
  warnLog,
  errorLog,
  perfLog,
  apiLog,
};

