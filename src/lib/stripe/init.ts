import Stripe from 'stripe';

const requiredStripeEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
] as const;

// Helper to get environment variables with fallbacks (Next 16+: use process.env only; no next/config)
const getStripeEnvVar = (key: string, _isPublic = false): string | undefined => {
  try {
    const direct = process.env[key];
    if (direct) return direct;

    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const prefixes = ['AMPLIFY_', 'AWS_AMPLIFY_', ''];
      for (const prefix of prefixes) {
        const value = process.env[`${prefix}${key}`];
        if (value) {
          console.log(`[STRIPE-ENV] Found ${key} with prefix: ${prefix}`);
          return value;
        }
      }
    }

    return process.env[key];
  } catch (error) {
    console.error(`[STRIPE-ENV] Error getting environment variable ${key}:`, error);
    return undefined;
  }
};

export const initStripeConfig = () => {
  try {
    if (process.env.NEXT_PHASE === 'build') {
      console.log('[STRIPE] Skipping environment checks during build phase');
      return null;
    }

    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      console.log('[STRIPE] AWS Lambda context:', {
        functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
        functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
        region: process.env.AWS_REGION,
        runtime: process.env.AWS_EXECUTION_ENV,
      });
    }

    const secretKey = getStripeEnvVar('STRIPE_SECRET_KEY');
    const webhookSecret = getStripeEnvVar('STRIPE_WEBHOOK_SECRET');
    const appUrl = getStripeEnvVar('NEXT_PUBLIC_APP_URL', true);

    console.log('[STRIPE] Environment state:', {
      phase: process.env.NEXT_PHASE,
      nodeEnv: process.env.NODE_ENV,
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      hasSecretKey: !!secretKey,
      hasWebhookSecret: !!webhookSecret,
      hasAppUrl: !!appUrl,
      runtime: typeof window === 'undefined' ? 'server' : 'client',
    });

    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. Please check:\n' +
          '1. AWS Amplify environment variables\n' +
          '2. Process environment variables',
      );
    }

    return new Stripe(secretKey, {
      apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
    });
  } catch (error) {
    console.error('[STRIPE] Failed to initialize Stripe:', error);
    throw error;
  }
};

export const REQUIRED_STRIPE_ENV_VARS = requiredStripeEnvVars;

export { getStripeEnvVar };
