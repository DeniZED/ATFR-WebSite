import { config } from './config.js';
import { pushLog } from './dashboard/index.js';

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function emit(args: unknown[]): void {
  const line = `[${new Date().toISOString()}] ${args.map(formatArg).join(' ')}`;
  console.log(line);
  pushLog(line);
}

export function log(...args: unknown[]): void {
  emit(args);
}

export function debug(...args: unknown[]): void {
  if (config.behaviour.debug) emit(['[DEBUG]', ...args]);
}

export function error(...args: unknown[]): void {
  emit(['[ERROR]', ...args]);
}

export function warn(...args: unknown[]): void {
  emit(['[WARN]', ...args]);
}
