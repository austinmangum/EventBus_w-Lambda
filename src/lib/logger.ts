import pino from 'pino';
export const log = pino({ level: process.env.LOG_LEVEL || 'info' });
export function withCtx(ctx: Record<string, any>) { return log.child(ctx); }
