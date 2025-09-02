import { Handler } from 'aws-lambda';
import { withCtx } from '../lib/logger';
import { idempotent } from '../lib/idempotency';
import { sfdcUpsert } from '../clients/salesforce';
import { setStatus, putState } from '../lib/ordersRepo';

export const handler: Handler = async (event: any) => {
  const { orderId, correlationId, input } = event;
  const log = withCtx({ correlationId, orderId, lambda: 'sfdcUpsert' });

  try {
    const key = `sfdc:upsert:${orderId}:v1`;
    const res = await idempotent(key, 7*86400, async () => {
      const subtotal = input.items.reduce((s: number, l: any) => s + l.qty*l.unitPrice, 0);
      return sfdcUpsert({
        districtId: input.customer.districtId,
        schoolId: input.customer.schoolId,
        email: input.customer.email,
        items: input.items,
        total: subtotal
      });
    });

    await setStatus({
      orderId,
      newStatus: 'SyncedToSfdc',
      allowedFrom: ['Paid', 'SyncedToSfdc'],
      extra: { sfdcAccountId: res.accountId, sfdcOrderId: res.orderId }
    });

    await putState({
      orderId,
      key: 'STATE#sfdcUpserted',
      attrs: { sfdcAccountId: res.accountId, sfdcOrderId: res.orderId }
    });

    log.info(res, 'sfdc upserted');
    return { ...event, sfdc: res };
  } catch (e: any) {
    if (e.message === 'DuplicateEvent') {
      log.warn('duplicate sfdc step ignored');
      return event;
    }
    const err: any = new Error('SfdcAPIError');
    err.name = 'SfdcAPIError';
    err.message = e.message;
    throw err;
  }
};
