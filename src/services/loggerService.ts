// Niumba - Logger Service
// Structured logging for better monitoring and debugging

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class LoggerService {
  private logLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;
  private sessionId: string = this.generateSessionId();

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Format log entry
   */
  private formatLog(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.message,
    ];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(`Context: ${JSON.stringify(entry.context)}`);
    }

    if (entry.error) {
      parts.push(`Error: ${entry.error.message}`);
      if (entry.error.stack) {
        parts.push(`Stack: ${entry.error.stack}`);
      }
    }

    if (entry.userId) {
      parts.push(`User: ${entry.userId}`);
    }

    return parts.join(' | ');
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    userId?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      userId,
      sessionId: this.sessionId,
    };
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    if (!__DEV__) return; // Never log debug in production

    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    console.log(this.formatLog(entry));
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    // Only log info in development, or if explicitly enabled
    if (__DEV__) {
      console.log(this.formatLog(entry));
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, message, context, error);
    console.warn(this.formatLog(entry));
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, any>, userId?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error, userId);
    console.error(this.formatLog(entry));

    // In production, send to error tracking service (Sentry, etc.)
    if (!__DEV__ && error) {
      // TODO: Integrate with Sentry
      // Sentry.captureException(error, { extra: context, user: { id: userId } });
    }
  }

  /**
   * Log performance metric
   */
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration,
      type: 'performance',
    });
  }

  /**
   * Log API call
   */
  apiCall(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    error?: Error
  ): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API ${method} ${endpoint} - ${statusCode} (${duration}ms)`;

    if (error) {
      this.error(message, error, { method, endpoint, statusCode, duration });
    } else {
      this.info(message, { method, endpoint, statusCode, duration, type: 'api' });
    }
  }

  /**
   * Log user action
   */
  userAction(action: string, context?: Record<string, any>, userId?: string): void {
    this.info(`User Action: ${action}`, { ...(context || {}), action, type: 'user_action', userId });
  }
}

// Export singleton instance
export const logger = new LoggerService();

// Export default
export default logger;



