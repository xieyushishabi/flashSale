import log4js from 'log4js';
import path from 'path';

// Ensure the logs directory exists, relative to project root
const logsDir = path.join(process.cwd(), 'logs');

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'file',
      filename: path.join(logsDir, 'app.log'), // Log file will be in <project_root>/logs/app.log
      maxLogSize: 10485760, // 10MB
      backups: 3, // Keep 3 backup files
      compress: true, // Compress backup files
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %c - %m',
      },
    },
  },
  categories: {
    default: {
      appenders: ['console', 'file'],
      level: 'debug',
    },
  },
});

const logger = log4js.getLogger('default');

export default logger;
