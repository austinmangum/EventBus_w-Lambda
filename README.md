# EventBus with Lambda

## Project Scope
This project implements a serverless event-driven architecture for order processing using AWS Lambda, DynamoDB, and step functions. It provides modular Lambda functions for validating orders, calculating tax, capturing payments, and updating salesforce. The goal is to demonstrate scalable, maintainable event workflows using lambda and Javascript.

## Repository Setup
- **Handlers**: Located in `src/handlers/`, each file is a Lambda function for a specific workflow step (e.g., `validateInit`, `paymentCapture`, `taxCalculate`).
- **Clients**: In `src/clients/`, these modules integrate with external APIs (Avalara, Stripe, Salesforce).
- **Lib**: Shared utilities and data access (DynamoDB, logging, schemas) are in `src/lib/`.
- **Layer Packaging**: The `scripts/build-layer.cjs` script bundles shared code into a Lambda layer (`layer/nodejs/node_modules/@hil/lib`) for efficient reuse across functions.
- **TypeScript**: The project uses TypeScript for type safety and 

## Cloud Architecture Overview
- **Lambda Functions**: Each handler is deployed as an AWS Lambda function. They process events, validate data, interact with DynamoDB, and call external APIs.
- **Lambda Layer**: Shared code is packaged as a Lambda layer, attached to all functions for consistent access to utilities and clients.
- **DynamoDB**: Used for order metadata and idempotency tracking. Table names are provided via environment variables (`ORDERS_TABLE`, `IDEMP_TABLE`).
- **Event Flow**: Events (e.g., new orders) trigger the workflow, passing state between Lambda functions. Each function performs its step and forwards results.
- **External Integrations**: Tax calculation, payment, and CRM updates are handled via dedicated client modules, with stubbed logic for local development.
- **Environment Variables**: Configure table names, API keys, and stub flags in the Lambda environment for each function.

## Notes
- The Avalara, salesforce, and Stripe clients are stubbed for local testing since I don't have access to their APIs.
- The workflow is designed for simplicity and scalability, with each step handling its own responsibilities
- TypeScript and modular design make it easy to extend or swap workflow steps.
