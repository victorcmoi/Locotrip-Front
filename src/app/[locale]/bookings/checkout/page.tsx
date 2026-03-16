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

const getReadableErrorMessage = (error: unknown): string => {
  if (!error) return 'Erreur inconnue';
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
  }

  return 'Erreur inconnue';
};

function CheckoutForm({
  total,
  onSuccess,
}: {
  total: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
}) {
  const dict = useTranslations();
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message || dict.checkout.paymentInfoInvalid);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (error) {
        toast.error(error.message || dict.checkout.paymentFailed);
        return;
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        toast.error(dict.checkout.paymentNotConfirmed);
        return;
      }

      await onSuccess(paymentIntent.id);
    } catch (error) {
      toast.error(`Erreur Stripe: ${getReadableErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{ layout: 'tabs' }}
        onReady={() => setIsPaymentElementReady(true)}
        onLoadError={() => {
          toast.error(dict.checkout.stripeLoadMethodsError);
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !elements || !isPaymentElementReady || isSubmitting}
        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl py-3 disabled:opacity-60"
      >
        {isSubmitting ? dict.checkout.paymentInProgress : `${dict.checkout.pay} ${total.toFixed(2)} €`}
      </button>

      {!isPaymentElementReady && (
        <p className="text-sm text-dark/70">{dict.checkout.loadingPaymentMethods}</p>
      )}
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
  const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.trim();

  const stripePromise = useMemo(() => {
    return stripePublicKey ? loadStripe(stripePublicKey) : null;
  }, [stripePublicKey]);

  const elementsOptions = useMemo(() => {
    if (!clientSecret) return undefined;
    return {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
      },
    };
  }, [clientSecret]);

  if (status === 'unauthenticated') {
    router.replace(localizedPath(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`));
    return null;
  }

  if (isLoading || !experience || !selectedAvailability) {
    return <div className="min-h-[60vh] flex items-center justify-center">{dict.common.loading}</div>;
  }

  const initializePayment = async () => {
    if (!stripePromise) {
      toast.error(dict.checkout.stripePublicKeyMissing);
      return;
    }

    if (clientSecret) return;
    setCreatingIntent(true);

    try {
      const result = await createStripePaymentIntent({
        amount: Math.round(pricing.total * 100),
        currency: 'eur',
        description: `Reservation ${experience.title}`,
      });

      setClientSecret(result.clientSecret);
    } catch (error) {
      toast.error(dict.checkout.stripeInitError);
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

      toast.success(dict.checkout.bookingAndPaymentSuccess);
      router.push(localizedPath('/me/bookings'));
    } catch {
      toast.error(dict.checkout.bookingFinalizeError);
    }
  };

  return (
    <section className="max-w-[92vw] mx-auto py-10 md:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-6 space-y-6">
        <h1 className="text-2xl font-bold text-dark">{dict.checkout.securePayment}</h1>

        {!clientSecret ? (
          <button
            onClick={initializePayment}
            disabled={creatingIntent || !stripePromise}
            className="bg-accent hover:bg-accent/90 text-white rounded-xl px-5 py-3 font-semibold"
          >
            {creatingIntent ? dict.checkout.paymentPreparing : dict.checkout.continueToStripe}
          </button>
        ) : (
          stripePromise &&
          elementsOptions && (
            <Elements key={clientSecret} stripe={stripePromise} options={elementsOptions}>
              <CheckoutForm total={pricing.total} onSuccess={onPaymentSuccess} />
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
        <p className="text-dark/70 mb-4">{participants} {dict.checkout.participant}</p>

        <div className="space-y-2 text-sm text-dark border-t border-gray-300 pt-4">
          <div className="flex items-center justify-between">
            <span>{dict.checkout.unitPrice}</span>
            <span>{pricing.unitPrice.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{dict.checkout.subtotal}</span>
            <span>{pricing.subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{dict.checkout.serviceFee}</span>
            <span>{pricing.serviceFee.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{dict.checkout.taxes}</span>
            <span>{pricing.tax.toFixed(2)} €</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold border-t border-gray-300 pt-3 mt-3">
            <span>{dict.checkout.total}</span>
            <span>{pricing.total.toFixed(2)} €</span>
          </div>
        </div>
      </aside>
    </section>
  );
}
