import { z } from 'zod';
import { PaymentStatusEnum } from './enums';

export const paymentSchema = z.object({
    id: z.string().uuid(),
    booking_id: z.string().uuid(),
    amount: z.number(),
    currency: z.string().length(3).default('eur'),
    payment_date: z.string().or(z.date()),
    method: z.string(),
    status: PaymentStatusEnum,
    stripe_payment_intent_id: z.string().nullish(),
    stripe_charge_id: z.string().nullish(),
    stripe_customer_id: z.string().nullish(),
    failure_reason: z.string().nullish(),
    refunded_amount: z.number().nullish(),
    refunded_at: z.string().or(z.date()).nullish(),
    metadata: z.record(z.string(), z.any()).nullish(),
    created_at: z.string().or(z.date()),
    updated_at: z.string().or(z.date()),
});

export const paymentsSchema = z.array(paymentSchema);

export const createPaymentSchema = z.object({
    booking_id: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.string().length(3).default('eur'),
    method: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type Payments = z.infer<typeof paymentsSchema>;
export type CreatePayment = z.infer<typeof createPaymentSchema>;
