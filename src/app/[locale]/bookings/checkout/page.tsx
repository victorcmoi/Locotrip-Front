'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocalizedPath, useTranslations } from '@/providers/i18n.provider';
import { useExperienceAvailabilities, useExperienceById } from '@/services/experiences/getExperiences';
import { createBooking } from '@/services/bookings/createBooking';
import { createPayment, createStripePaymentIntent } from '@/services/payments/createPayment';
import { toast } from 'sonner';
import Image from 'next/image';
import { MinioHelpers } from '@/utils/minio';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

const SERVICE_FEE_RATE = 0.1;
const TAX_RATE = 0.2;

function CheckoutForm({
  clientSecret,
  total,
  onSuccess,
}: {
  clientSecret: string;
  total: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Paiement échoué');
      setIsSubmitting(false);
      return;
    }

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      toast.error('Le paiement n\'a pas pu être confirmé.');
      setIsSubmitting(false);
      return;
    }

    await onSuccess(paymentIntent.id);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl py-3 disabled:opacity-60"
      >
        {isSubmitting ? 'Paiement en cours...' : `Payer ${total.toFixed(2)} €`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const dict = useTranslations();
  const localizedPath = useLocalizedPath();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const experienceId = searchParams.get('experience_id') || '';
  const availabilityId = searchParams.get('availability_id') || '';
  const participants = Number(searchParams.get('participants') || '1');

  const { data: experience, isLoading } = useExperienceById(experienceId);
  const { data: availabilities = [] } = useExperienceAvailabilities(experienceId);

  const selectedAvailability = availabilities.find((a) => a.id === availabilityId);

  const pricing = useMemo(() => {
    const unitPrice = experience?.price ?? 0;
    const subtotal = unitPrice * participants;
    const serviceFee = subtotal * SERVICE_FEE_RATE;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + serviceFee + tax;

    return { unitPrice, subtotal, serviceFee, tax, total };
  }, [experience?.price, participants]);

  const [clientSecret, setClientSecret] = useState<string>('');
  const [creatingIntent, setCreatingIntent] = useState(false);

  const stripePromise = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
    return key ? loadStripe(key) : null;
  }, []);

  if (status === 'unauthenticated') {
    router.replace(localizedPath(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`));
    return null;
  }

  if (isLoading || !experience || !selectedAvailability) {
    return <div className="min-h-[60vh] flex items-center justify-center">{dict.common.loading}</div>;
  }

  const initializePayment = async () => {
    if (clientSecret) return;
    setCreatingIntent(true);

    try {
      const result = await createStripePaymentIntent({
        amount: Math.round(pricing.total * 100),
        currency: 'eur',
        description: `Reservation ${experience.title}`,
      });
      setClientSecret(result.clientSecret);
    } catch {
      toast.error('Impossible d\'initialiser le paiement Stripe.');
    } finally {
      setCreatingIntent(false);
    }
  };

  const onPaymentSuccess = async (paymentIntentId: string) => {
    if (!session?.user?.id) return;

    try {
      const booking = await createBooking({
        user_id: session.user.id,
        experience_id: experience.id,
        booking_date: new Date(selectedAvailability.start_date).toISOString(),
        number_of_participants: participants,
        total_price: Number(pricing.total.toFixed(2)),
      });

      await createPayment({
        booking_id: booking.id,
        amount: Number(pricing.total.toFixed(2)),
        currency: 'eur',
        method: 'card',
        status: 'completed',
        stripe_payment_intent_id: paymentIntentId,
        metadata: {
          experience_id: experience.id,
          participants,
          availability_id: selectedAvailability.id,
        },
      });

      toast.success('Réservation confirmée et paiement validé.');
      router.push(localizedPath('/me/bookings'));
    } catch {
      toast.error('Paiement reçu mais réservation non finalisée. Contactez le support.');
    }
  };

  return (
    <section className="max-w-[92vw] mx-auto py-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-6 space-y-6">
        <h1 className="text-2xl font-bold text-dark">Paiement sécurisé</h1>

        {!clientSecret ? (
          <button
            onClick={initializePayment}
            disabled={creatingIntent}
            className="bg-accent hover:bg-accent/90 text-white rounded-xl px-5 py-3 font-semibold"
          >
            {creatingIntent ? 'Préparation du paiement...' : 'Continuer vers Stripe'}
          </button>
        ) : (
          stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} total={pricing.total} onSuccess={onPaymentSuccess} />
            </Elements>
          )
        )}
      </div>

      <aside className="lg:col-span-5 rounded-2xl border border-gray-200 bg-light p-6 h-fit">
        <div className="relative h-52 w-full rounded-xl overflow-hidden mb-4">
          <Image
            src={MinioHelpers.experience(experience.medias?.[0]?.url)}
            alt={experience.title}
            fill
            className="object-cover"
          />
        </div>

        <h2 className="text-xl font-bold text-dark mb-2">{experience.title}</h2>
        <p className="text-dark/70 mb-4">{participants} participant(s)</p>

        <div className="space-y-2 text-sm text-dark border-t border-gray-300 pt-4">
          <div className="flex items-center justify-between">
            <span>Prix unitaire</span>
            <span>{pricing.unitPrice.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Sous-total</span>
            <span>{pricing.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Frais de service</span>
            <span>{pricing.serviceFee.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Taxes</span>
            <span>{pricing.tax.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold border-t border-gray-300 pt-3 mt-3">
            <span>Total</span>
            <span>{pricing.total.toFixed(2)} €</span>
          </div>
        </div>
      </aside>
    </section>
  );
}
