import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

// Get Stripe settings from database
async function getStripeSettings() {
  const settings = await db.setting.findMany({
    where: {
      key: {
        in: ['stripeSecretKey', 'stripePublicKey', 'stripeWebhookSecret']
      }
    }
  });
  
  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);
  
  return {
    secretKey: settingsMap.stripeSecretKey || process.env.STRIPE_SECRET_KEY || '',
    publicKey: settingsMap.stripePublicKey || process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    webhookSecret: settingsMap.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '',
  };
}

// Initialize Stripe
const getStripe = async () => {
  const settings = await getStripeSettings();
  if (!settings.secretKey) {
    return null;
  }
  return new Stripe(settings.secretKey, {
    apiVersion: '2024-12-18.acacia',
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, campaignId, campaignName, donorEmail, donorName } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const stripe = await getStripe();
    
    // Check if we have Stripe configured
    if (!stripe) {
      // Return simulated checkout data for demo mode
      return NextResponse.json({
        isDemo: true,
        message: 'Stripe not configured. Add your API keys in Admin > Settings > API Keys. Payment simulated.',
        checkoutUrl: null,
        sessionId: `cs_demo_${Date.now()}`,
        amount,
        campaignId,
        success: true,
      });
    }

    // Get site URL from settings
    const siteUrlSetting = await db.setting.findUnique({
      where: { key: 'siteUrl' }
    });
    const baseUrl = siteUrlSetting?.value || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Donation: ${campaignName || 'Church Campaign'}`,
              description: `Supporting ${campaignName || 'our mission'}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/campaign/${campaignId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/campaign/${campaignId}?payment=cancelled`,
      customer_email: donorEmail,
      metadata: {
        campaignId: campaignId || '',
        donorName: donorName || '',
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      success: true,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
