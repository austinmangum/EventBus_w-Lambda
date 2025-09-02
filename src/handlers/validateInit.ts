import { Handler } from 'aws-lambda';
import { withCtx } from '../lib/logger.js';
import { OrderInput } from '../lib/schemas.js';
import { putMetaIfAbsent } from '../lib/ordersRepo.js';
import crypto from 'crypto';

export const handler: Handler = async (event: any) => {
  try {
    const input = OrderInput.parse(event); // throws if invalid
    const orderId = 'ord_' + crypto.randomUUID().slice(0,8);
    const correlationId = event.correlationId || crypto.randomUUID();

    await putMetaIfAbsent({
      orderId,
      status: 'Created',
      customer: input.customer,
      items: input.items,
      currency: input.currency,
      shipTo: input.shipTo
    });

    const log = withCtx({ correlationId, orderId, lambda: 'validateInit' });
    log.info({ items: input.items.length }, 'order initialized');

    return { orderId, correlationId, input }; // forwarded in state input
  } catch (e: any) {
    const err: any = new Error('BadRequest');
    err.name = 'BadRequest';
    err.message = e.message;
    throw err;
  }
};
