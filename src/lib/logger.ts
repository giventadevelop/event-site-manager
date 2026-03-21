/**
 * Tagged logging. Uses console only so the module is safe for Edge Runtime (e.g. middleware).
 * Avoid process.stderr — Next.js Edge bundles flag Node-only APIs even behind guards.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
}

function writeLog(logMessage: LogMessage): void {
  const line = `[ROBUST-LOG] ${JSON.stringify(logMessage)}`;
  const human = `[${logMessage.tag}] [${logMessage.level}] ${logMessage.message}`;
  const extra = logMessage.data;

  switch (logMessage.level) {
    case 'ERROR':
      console.error(line, extra ?? '');
      console.error(human, extra ?? '');
      break;
    case 'WARN':
      console.warn(line, extra ?? '');
      console.warn(human, extra ?? '');
      break;
    default:
      console.log(line, extra ?? '');
      console.log(human, extra ?? '');
  }
}

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

export const logger = createLogger('GLOBAL');
