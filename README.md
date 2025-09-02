# EventBus_w-Lambda

A small event driven AWS-native integration layer that tracks orders through their life cycle and integrates **Stripe (payments/refunds)**, **Avalara (tax)**, and **Salesforce/Kugamon (CRM Orders)** into one checkout flow.

## What it does
1) `POST /checkout` — validates a small cart → emits `order.created.v1`.
2) `tax-calc` — calls Avalara (or stub) → emits `order.taxCalculated.v1`.
3) `payment` — creates/captures Stripe PaymentIntent → emits `order.paid.v1`.
4) `sfdc-upsert` — upserts Account/Contact + creates Kugamon Order → emits `sfdc.upserted.v1`.
5) `POST /stripe/webhook` — reconciles refunds → emits `order.refunded.v1`.
6) DLQs on each consumer + `scripts/replay-dlq.ts` to safely re-enqueue.

## Stack
- **API Gateway + Lambda (Node/TS)**, **EventBridge**, **SQS DLQs**, **DynamoDB** (orders + idempotency)
- **Zod** event contracts, **pino** structured logs, correlation IDs.

## Quick start
```bash
# prerequisites: Node 18+, AWS CLI configured, CDK bootstrap completed
npm i
npm run synth
npm run deploy  # deploy all stacks

# Invoke checkout (replace API URL printed by CDK)
curl -X POST "$API/checkout" -H "Content-Type: application/json" -d '{
  "customer": {"districtId":"D123","schoolId":"S456","email":"teacher@example.edu"},
  "items":[{"sku":"HEG-PHONEMIC-G1","qty":1,"unitPrice":129.00}],
  "currency":"usd",
  "paymentMethod":"credit_card",
  "shipTo":{"line1":"123 Main","city":"Chicago","region":"IL","postal":"60601"}
}'
