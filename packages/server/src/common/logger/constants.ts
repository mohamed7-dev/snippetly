export enum LogContextEnum {
  SERVER = "SERVER",
  DATABASE = "DATABASE",
  PERFORMANCE = "PERFORMANCE",
}
export type LogContext = keyof typeof LogContextEnum;

export const DEFAULT_CONTEXT = LogContextEnum.SERVER;
