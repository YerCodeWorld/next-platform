// packages/edu-exercises/src/utils/logger.ts

/**
 * Logging utilities for the exercise system
 * Provides structured logging for debugging and monitoring
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  component?: string;
  userId?: string;
  exerciseId?: string;
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableStorage: boolean;
  maxStoredLogs: number;
  logLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class ExerciseLogger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig = {
    enableConsole: true,
    enableStorage: true,
    maxStoredLogs: 100,
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  };

  constructor(config?: Partial<LoggerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Load existing logs from localStorage
    this.loadStoredLogs();
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [EXERCISE-${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, component?: string) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      component
    };

    // Add to internal log storage
    if (this.config.enableStorage) {
      this.logs.push(entry);
      
      // Trim logs if we exceed max
      if (this.logs.length > this.config.maxStoredLogs) {
        this.logs = this.logs.slice(-this.config.maxStoredLogs);
      }
      
      // Save to localStorage
      this.saveLogsToStorage();
    }

    // Console logging
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(level, message, context);
      
      switch (level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage);
          break;
      }
    }
  }

  private loadStoredLogs() {
    if (!this.config.enableStorage) return;
    
    try {
      const stored = localStorage.getItem('exercise-logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored logs:', error);
    }
  }

  private saveLogsToStorage() {
    if (!this.config.enableStorage) return;
    
    try {
      localStorage.setItem('exercise-logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to storage:', error);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>, component?: string) {
    this.log('debug', message, context, component);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>, component?: string) {
    this.log('info', message, context, component);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>, component?: string) {
    this.log('warn', message, context, component);
  }

  /**
   * Log error message
   */
  error(message: string, context?: Record<string, any>, component?: string) {
    this.log('error', message, context, component);
  }

  /**
   * Log exercise-specific events
   */
  exerciseEvent(
    event: string, 
    exerciseId: string, 
    data?: Record<string, any>, 
    component?: string
  ) {
    this.info(`Exercise Event: ${event}`, { 
      exerciseId, 
      ...data 
    }, component);
  }

  /**
   * Log parser events
   */
  parserEvent(
    event: string, 
    exerciseType?: string, 
    data?: Record<string, any>
  ) {
    this.debug(`Parser Event: ${event}`, { 
      exerciseType, 
      ...data 
    }, 'Parser');
  }

  /**
   * Log user interaction events
   */
  userEvent(
    action: string, 
    exerciseId?: string, 
    data?: Record<string, any>
  ) {
    this.info(`User Action: ${action}`, { 
      exerciseId, 
      ...data 
    }, 'UserInteraction');
  }

  /**
   * Log performance metrics
   */
  performance(
    metric: string, 
    duration: number, 
    context?: Record<string, any>
  ) {
    this.info(`Performance: ${metric}`, { 
      duration: `${duration}ms`, 
      ...context 
    }, 'Performance');
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs for a specific component
   */
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter(log => log.component === component);
  }

  /**
   * Get logs for a specific exercise
   */
  getLogsByExercise(exerciseId: string): LogEntry[] {
    return this.logs.filter(log => log.exerciseId === exerciseId);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    if (this.config.enableStorage) {
      localStorage.removeItem('exercise-logs');
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Configure logger
   */
  configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create a child logger for a specific component
   */
  createChildLogger(component: string) {
    return {
      debug: (message: string, context?: Record<string, any>) => 
        this.debug(message, context, component),
      info: (message: string, context?: Record<string, any>) => 
        this.info(message, context, component),
      warn: (message: string, context?: Record<string, any>) => 
        this.warn(message, context, component),
      error: (message: string, context?: Record<string, any>) => 
        this.error(message, context, component),
    };
  }
}

// Create singleton logger instance
export const logger = new ExerciseLogger();

// Convenience functions for common logging patterns
export const logExerciseStart = (exerciseId: string, type: string) => {
  logger.exerciseEvent('start', exerciseId, { type });
};

export const logExerciseComplete = (exerciseId: string, score?: number, timeSpent?: number) => {
  logger.exerciseEvent('complete', exerciseId, { score, timeSpent });
};

export const logExerciseError = (exerciseId: string, error: Error) => {
  logger.error('Exercise error', { 
    exerciseId, 
    error: error.message, 
    stack: error.stack 
  });
};

export const logParserError = (content: string, error: Error) => {
  logger.parserEvent('parse_error', undefined, { 
    contentLength: content.length,
    error: error.message 
  });
};

export const logValidationError = (exerciseType: string, errors: string[]) => {
  logger.parserEvent('validation_error', exerciseType, { errors });
};

export const logUserAction = (action: string, exerciseId?: string, data?: Record<string, any>) => {
  logger.userEvent(action, exerciseId, data);
};

export const measurePerformance = <T>(
  name: string, 
  fn: () => T, 
  context?: Record<string, any>
): T => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    logger.performance(name, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.performance(`${name}_error`, duration, { 
      ...context, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
};

export const measureAsyncPerformance = async <T>(
  name: string, 
  fn: () => Promise<T>, 
  context?: Record<string, any>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(name, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.performance(`${name}_error`, duration, { 
      ...context, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
};

// Development helper to expose logger to window for debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).exerciseLogger = logger;
}