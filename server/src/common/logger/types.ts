export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

export type LogContext = 'SERVER' | 'DATABASE' | 'PERFORMANCE';

export interface LogMeta {
  [key: string]: any;
}

export interface ContextLogger {
  error: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  http: (message: string, meta?: LogMeta) => void;
  debug: (message: string, meta?: LogMeta) => void;
}

export interface LoggerInterface extends ContextLogger {
  // Base logger methods
}

export interface PerformanceLogMeta extends LogMeta {
  duration?: number;
  operation?: string;
  endpoint?: string;
  statusCode?: number;
}

export interface DatabaseLogMeta extends LogMeta {
  query?: string;
  queryTime?: number;
  table?: string;
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP';
  affectedRows?: number;
}

export interface ServerLogMeta extends LogMeta {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
}
