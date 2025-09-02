import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const ddbDoc = DynamoDBDocumentClient.from(client);
export const ORDERS_TABLE = process.env.ORDERS_TABLE!;
export const IDEMP_TABLE = process.env.IDEMP_TABLE!;
