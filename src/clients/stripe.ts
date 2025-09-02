import Stripe from 'stripe';
export function stripeClient() {
  const key = process.env.STRIPE_API_KEY;
  if (!key && process.env.STRIPE_STUB === 'true') {
    return {
      paymentIntents: {
        create: async (args: any) => ({ id: 'pi_stub', status: 'succeeded', amount: args.amount })
      }
    } as unknown as Stripe;
  }
  if (!key) throw new Error('Missing STRIPE_API_KEY');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}
