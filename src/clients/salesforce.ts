export interface SfdcResult { accountId: string; orderId: string; }
export async function sfdcUpsert(_args: {
  districtId: string; schoolId: string; email: string;
  items: { sku: string; qty: number; unitPrice: number }[];
  total: number;
}): Promise<SfdcResult> {
  if (process.env.SF_STUB === 'true' || !process.env.SF_USERNAME) {
    return { accountId: '001-stub', orderId: 'a07-stub' };
  }
  const e: any = new Error('SFDC not implemented'); e.name = 'FatalCrmError'; throw e;
}
