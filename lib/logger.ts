/**
 * Conditional logging system for production safety
 * Only logs in development, except for errors which are always logged
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Development-only logs - stripped in production
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Development-only warnings - stripped in production
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Always log errors (but sanitized in production)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Development-only info logs with prefix
   */
  info: (context: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[${context}]`, ...args);
    }
  },

  /**
   * Development-only debug logs
   */
  debug: (context: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG:${context}]`, ...args);
    }
  },
};

/**
 * Sanitize error messages for production
 */
export function sanitizeError(error: unknown): { message: string; expose: boolean } {
  if (isDevelopment) {
    // In development, expose full error details
    return {
      message: error instanceof Error ? error.message : String(error),
      expose: true,
    };
  }

  // In production, return generic message
  return {
    message: 'An error occurred while processing your request',
    expose: false,
  };
}

/**
 * Safe error response for API routes
 */
export function createErrorResponse(error: unknown, status: number = 500) {
  const { message, expose } = sanitizeError(error);

  // Always log the real error server-side
  logger.error('API Error:', error);

  return {
    error: message,
    ...(expose && error instanceof Error && { details: error.stack }),
  };
}
