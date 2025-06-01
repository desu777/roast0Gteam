interface LogLevel {
  level: string;
  color: string;
}

const LOG_LEVELS: Record<string, LogLevel> = {
  info: { level: 'INFO', color: '\x1b[36m' },    // Cyan
  warn: { level: 'WARN', color: '\x1b[33m' },    // Yellow
  error: { level: 'ERROR', color: '\x1b[31m' },  // Red
  debug: { level: 'DEBUG', color: '\x1b[90m' },  // Gray
  success: { level: 'SUCCESS', color: '\x1b[32m' } // Green
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = this.getTimestamp();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `${level.color}[${timestamp}] ${level.level}:${RESET_COLOR} ${message}${formattedArgs}`;
  }

  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage(LOG_LEVELS.info, message, ...args));
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(LOG_LEVELS.warn, message, ...args));
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage(LOG_LEVELS.error, message, ...args));
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      console.log(this.formatMessage(LOG_LEVELS.debug, message, ...args));
    }
  }

  success(message: string, ...args: any[]): void {
    console.log(this.formatMessage(LOG_LEVELS.success, message, ...args));
  }
}

export const logger = new Logger(); 