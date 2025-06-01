import log4js, { LoggingEvent } from 'log4js';
import path from 'path';
import os from 'os'; // For hostname

// Ensure the logs directory exists, relative to project root
const logsDir = path.join(process.cwd(), 'logs');

// Custom JSON layout for file appender
function jsonLayout(logEvent: LoggingEvent): string {
  const logObject: Record<string, any> = {
    timestamp: logEvent.startTime,
    level: logEvent.level.levelStr,
    category: logEvent.categoryName,
    hostname: os.hostname(),
    pid: logEvent.pid,
    // requestId: logEvent.context.requestId || 'N/A', // We'll add context later
    message: '',
    stack: undefined, // Initialize stack as undefined, only add if present
  };

  if (logEvent.data.length > 0) {
    const firstArg = logEvent.data[0];
    let messageParts: string[] = [];

    if (firstArg instanceof Error) {
      messageParts.push(firstArg.message);
      logObject.stack = firstArg.stack;
      // Process remaining arguments if they exist
      if (logEvent.data.length > 1) {
        messageParts.push(...logEvent.data.slice(1).map(arg => {
          if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg);
          }
          return String(arg);
        }));
      }
    } else {
      // Handle all arguments as parts of the message
      messageParts = logEvent.data.map(arg => {
        if (arg instanceof Error) { // Handle errors that are not the first argument
          if(!logObject.stack) logObject.stack = arg.stack; // Capture first error stack
          return arg.message;
        }
        if (typeof arg === 'object' && arg !== null) {
          return JSON.stringify(arg);
        }
        return String(arg);
      });
    }
    logObject.message = messageParts.join(' ');
  }
  // Remove stack from logObject if it's undefined to keep JSON clean
  if (logObject.stack === undefined) {
    delete logObject.stack;
  }

  return JSON.stringify(logObject);
}

log4js.addLayout('json', () => jsonLayout);

log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        // Keep console logs human-readable, with colors
        pattern: '%[%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %c%] - %m',
      },
    },
    file: {
      type: 'file',
      filename: path.join(logsDir, 'app.log'),
      maxLogSize: 10485760, // 10MB
      backups: 3,
      compress: true,
      layout: {
        type: 'json', // Use our custom json layout
      },
    },
  },
  categories: {
    default: {
      appenders: ['console', 'file'],
      level: process.env.LOG_LEVEL || 'debug', // Allow overriding log level via env
      enableCallStack: true, // Useful for debugging, consider performance in prod
    },
  },
});

const logger = log4js.getLogger('default');

export default logger;
