import { ddbDoc, IDEMP_TABLE } from './ddb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export async function idempotent<T>(key: string, ttlSecs: number, work: () => Promise<T>): Promise<T> {
  try {
    await ddbDoc.send(new PutCommand({
      TableName: IDEMP_TABLE,
      Item: { key, createdAt: Date.now(), expiresAt: Math.floor(Date.now()/1000)+ttlSecs },
      ConditionExpression: 'attribute_not_exists(#k)',
      ExpressionAttributeNames: { '#k': 'key' }
    }));
  } catch (e: any) {
    if (e.name === 'ConditionalCheckFailedException') {
      const err = new Error('DuplicateEvent');
      (err as any).retryable = false;
      throw err;
    }
    throw e;
  }
  return work();
}
