import morgan from 'morgan';
import winston, { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const isConsoleLoggingEnabled = !process.env.SUPRESS_LOG;

const transports: winston.transport[] = [
  new DailyRotateFile({
    filename: 'logs/access-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Conditionally add console transport based on SUPRESS_LOG
if (isConsoleLoggingEnabled) {
  transports.push(
    new winston.transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports,
});

export const morganMiddleware = morgan('combined', {
  stream: { write: msg => logger.info(msg.trim()) },
});
