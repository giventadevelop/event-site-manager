import Stripe from 'stripe';

let cached: Stripe | null = null;

/** Lazy Stripe client — avoids throwing during Next.js build when env vars are unset. */
export function getServerStripe(): Stripe {
  if (cached) return cached;
  const key =
    process.env.STRIPE_SECRET_KEY ||
    process.env.AMPLIFY_STRIPE_SECRET_KEY ||
    process.env.AWS_AMPLIFY_STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  cached = new Stripe(key, {
    apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
  });
  return cached;
}
