import { ddbDoc, ORDERS_TABLE } from './ddb';
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export type OrderStatus = 'Created' | 'TaxCalculated' | 'Paid' | 'SyncedToSfdc' | 'Refunded' | 'Error';

export async function putMetaIfAbsent(input: {
  orderId: string;
  status: OrderStatus;
  customer: any;
  items: any[];
  currency: string;
  shipTo: any;
}) {
  await ddbDoc.send(new PutCommand({
    TableName: ORDERS_TABLE,
    Item: {
      pk: `ORDER#${input.orderId}`,
      sk: 'META#',
      orderId: input.orderId,
      status: input.status,
      version: 1,
      customer: input.customer,
      items: input.items,
      currency: input.currency,
      shipTo: input.shipTo,
      createdAt: new Date().toISOString()
    },
    ConditionExpression: 'attribute_not_exists(pk)'
  }));
}

export async function setStatus(input: {
  orderId: string;
  newStatus: OrderStatus;
  allowedFrom: OrderStatus[];
  extra?: Record<string, any>;
}) {
  const names: Record<string,string> = { '#s': 'status', '#v': 'version' };
  const values: Record<string,any> = { ':ns': input.newStatus, ':inc': 1, ':zero': 0 };
  const allowedTokens: string[] = [];

  input.allowedFrom.forEach((st, i) => {
    const key = `:a${i}`;
    values[key] = st;
    allowedTokens.push(key);
  });

  if (input.extra) {
    for (const [k, v] of Object.entries(input.extra)) {
      names[`#e_${k}`] = k;
      values[`:e_${k}`] = v;
    }
  }

  const setParts = ['#s = :ns', '#v = if_not_exists(#v,:zero) + :inc'];
  if (input.extra) {
    for (const k of Object.keys(input.extra)) setParts.push(`#e_${k} = :e_${k}`);
  }

  await ddbDoc.send(new UpdateCommand({
    TableName: ORDERS_TABLE,
    Key: { pk: `ORDER#${input.orderId}`, sk: 'META#' },
    UpdateExpression: `SET ${setParts.join(', ')}`,
    ConditionExpression: `attribute_not_exists(#s) OR #s IN (${allowedTokens.join(',')})`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values
  }));
}

export async function putState(input: {
  orderId: string;
  key: string; // e.g., STATE#taxCalculated
  attrs: Record<string, any>;
}) {
  await ddbDoc.send(new PutCommand({
    TableName: ORDERS_TABLE,
    Item: {
      pk: `ORDER#${input.orderId}`,
      sk: input.key,
      orderId: input.orderId,
      occurredAt: new Date().toISOString(),
      ...input.attrs
    }
  }));
}
