import { Handler } from 'aws-lambda';
import { withCtx } from '../lib/logger';

export const handler: Handler = async (event: any) => {
  const { orderId, correlationId } = event;
  const log = withCtx({ correlationId, orderId, lambda: 'successEmit' });
  // Opportunity to emit an EventBridge event or email
  log.info('workflow complete');
  return { ...event, done: true };
};
