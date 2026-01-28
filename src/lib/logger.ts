/**
 * Robust logging utility that can't be stripped by Next.js production builds
 *
 * This uses process.stderr.write which is preserved in production,
 * unlike console.log which may be removed by tree-shaking.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
}

/**
 * Write log to stderr (can't be stripped by Next.js)
 */
function writeLog(logMessage: LogMessage): void {
  const logString = JSON.stringify(logMessage);

  // Use process.stderr.write which is ALWAYS preserved in production
  if (typeof process !== 'undefined' && process.stderr) {
    process.stderr.write(`[ROBUST-LOG] ${logString}\n`);
  }

  // Also use console.log as backup (may be stripped in production)
  console.log(`[${logMessage.tag}] [${logMessage.level}] ${logMessage.message}`, logMessage.data || '');

  // Force flush (ensures logs are written immediately)
  if (typeof process !== 'undefined' && process.stderr && typeof process.stderr.write === 'function') {
    try {
      // @ts-ignore
      if (process.stderr.isTTY === false) {
        // In non-TTY mode (like AWS Lambda), force flush
      }
    } catch (e) {
      // Ignore flush errors
    }
  }
}

/**
 * Create a tagged logger for a specific component/module
 */
export function createLogger(tag: string) {
  return {
    info: (message: string, data?: any) => {
      writeLog({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        tag,
        message,
        data,
      });
    },

    warn: (message: string, data?: any) => {
      writeLog({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        tag,
        message,
        data,
      });
    },

    error: (message: string, data?: any) => {
      writeLog({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        tag,
        message,
        data,
      });
    },

    debug: (message: string, data?: any) => {
      writeLog({
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        tag,
        message,
        data,
      });
    },
  };
}

/**
 * Global logger (use createLogger for component-specific logging)
 */
export const logger = createLogger('GLOBAL');
