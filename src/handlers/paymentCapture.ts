import { Handler } from 'aws-lambda';
import { withCtx } from '../lib/logger';
import { stripeClient } from '../clients/stripe';
import { idempotent } from '../lib/idempotency';
import { setStatus, putState } from '../lib/ordersRepo';

export const handler: Handler = async (event: any) => {
  const { orderId, correlationId, input, tax } = event;
  const log = withCtx({ correlationId, orderId, lambda: 'paymentCapture' });

  const subtotal = input.items.reduce((s: number, l: any) => s + l.qty * l.unitPrice, 0);
  const amount = Math.round((subtotal + (tax?.totalTax || 0)) * 100);

  const stripe = stripeClient();
  const key = `stripe:pi:${orderId}:v1`;

  try {
    const pi = await idempotent(key, 86400, async () => {
      return stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        // @ts-ignore for brevity in MVP
        automatic_payment_methods: { enabled: true }
      });
    });

    await setStatus({
      orderId,
      newStatus: 'Paid',
      allowedFrom: ['TaxCalculated', 'Paid'],
      extra: { paymentIntentId: pi.id, amountCaptured: amount/100 }
    });

    await putState({
      orderId,
      key: 'STATE#paid',
      attrs: { paymentIntentId: pi.id, amountCaptured: amount/100 }
    });

    log.info({ paymentIntentId: pi.id, amount }, 'payment captured');
    return { ...event, payment: { paymentIntentId: pi.id, amountCaptured: amount/100 } };
  } catch (e: any) {
    if (e.message === 'DuplicateEvent') {
      // Safe to treat as success (previous run finished this step)
      log.warn('duplicate payment step ignored');
      return event;
    }
    const err: any = new Error('StripeAPIError');
    err.name = 'StripeAPIError';
    err.message = e.message;
    throw err;
  }
};
