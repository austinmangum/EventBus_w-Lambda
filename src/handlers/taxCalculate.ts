import { Handler } from 'aws-lambda';
import { withCtx } from '../lib/logger';
import { calcTax } from '../clients/avalara';
import { setStatus, putState } from '../lib/ordersRepo';

export const handler: Handler = async (event: any) => {
  const { orderId, correlationId, input } = event;
  const log = withCtx({ correlationId, orderId, lambda: 'taxCalculate' });

  try {
    const res = await calcTax(input.items, input.shipTo);

    await setStatus({
      orderId,
      newStatus: 'TaxCalculated',
      allowedFrom: ['Created', 'TaxCalculated'],
      extra: { totalTax: res.totalTax }
    });

    await putState({
      orderId,
      key: 'STATE#taxCalculated',
      attrs: { totalTax: res.totalTax, taxLines: res.lines }
    });

    log.info({ totalTax: res.totalTax }, 'tax calculated');
    return { ...event, tax: res };
  } catch (e: any) {
    if (e.name === 'FatalTaxError') throw e;
    const err: any = new Error('AvalaraRateLimit');
    err.name = 'AvalaraRateLimit';
    err.message = e.message;
    throw err;
  }
};
