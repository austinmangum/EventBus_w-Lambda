import { z } from 'zod';

export const OrderInput = z.object({
  customer: z.object({
    districtId: z.string(),
    schoolId: z.string(),
    email: z.string().email(),
  }),
  items: z.array(z.object({
    sku: z.string(),
    qty: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    taxCode: z.string().optional()
  })).min(1),
  currency: z.literal('usd'),
  paymentMethod: z.literal('credit_card'),
  shipTo: z.object({
    line1: z.string(),
    city: z.string(),
    region: z.string(),
    postal: z.string()
  })
});
export type OrderInput = z.infer<typeof OrderInput>;
