import { ApiRequest } from '@/services/instance';
import { paymentSchema, type Payment } from '@/schemas/payment';
import { z } from 'zod';

export interface CreatePaymentPayload {
  booking_id: string;
  amount: number;
  currency?: string;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_customer_id?: string;
  metadata?: Record<string, unknown>;
}

const createPaymentIntentResponseSchema = z.object({
  clientSecret: z.string(),
  paymentIntentId: z.string(),
});

export type CreatePaymentIntentResponse = z.infer<typeof createPaymentIntentResponseSchema>;

export const createStripePaymentIntent = async (payload: {
  amount: number;
  currency: string;
  description?: string;
}): Promise<CreatePaymentIntentResponse> => {
  return new ApiRequest<CreatePaymentIntentResponse>(createPaymentIntentResponseSchema).post(
    'stripe/create-payment-intent',
    payload,
  );
};

export const createPayment = async ({ booking_id, ...payload }: CreatePaymentPayload): Promise<Payment> => {
  return new ApiRequest<Payment>(paymentSchema).post(
    `bookings/${booking_id}/payments`,
    {
      booking_id,
      ...payload,
    },
  );
};
