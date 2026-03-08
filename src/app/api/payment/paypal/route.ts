import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get PayPal settings from database
async function getPayPalSettings() {
  const settings = await db.setting.findMany({
    where: {
      key: {
        in: ['paypalClientId', 'paypalClientSecret', 'paypalMode']
      }
    }
  });
  
  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);
  
  return {
    clientId: settingsMap.paypalClientId || process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: settingsMap.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET || '',
    mode: settingsMap.paypalMode || process.env.PAYPAL_MODE || 'sandbox',
  };
}

// PayPal API configuration
const getPayPalApi = (mode: string) => {
  return mode === 'live' 
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
};

// Get PayPal access token
async function getPayPalAccessToken(clientId: string, clientSecret: string, mode: string) {
  if (!clientId || !clientSecret) {
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const api = getPayPalApi(mode);
  
  const response = await fetch(`${api}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, campaignId, campaignName, donorEmail } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get PayPal settings from database
    const paypalSettings = await getPayPalSettings();
    
    // Check if PayPal is configured
    if (!paypalSettings.clientId || !paypalSettings.clientSecret) {
      // Return simulated response for demo mode
      return NextResponse.json({
        isDemo: true,
        message: 'PayPal not configured. Add your API keys in Admin > Settings > API Keys. Payment simulated.',
        orderId: `PAYPAL_DEMO_${Date.now()}`,
        approvalUrl: null,
        amount,
        campaignId,
        success: true,
      });
    }

    const accessToken = await getPayPalAccessToken(
      paypalSettings.clientId,
      paypalSettings.clientSecret,
      paypalSettings.mode
    );
    
    if (!accessToken) {
      return NextResponse.json({
        isDemo: true,
        message: 'PayPal credentials invalid. Payment simulated.',
        orderId: `PAYPAL_DEMO_${Date.now()}`,
        success: true,
      });
    }

    // Get site URL from settings
    const siteUrlSetting = await db.setting.findUnique({
      where: { key: 'siteUrl' }
    });
    const baseUrl = siteUrlSetting?.value || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const api = getPayPalApi(paypalSettings.mode);

    // Create PayPal order
    const orderResponse = await fetch(`${api}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            description: `Donation: ${campaignName || 'Church Campaign'}`,
            custom_id: campaignId || '',
          },
        ],
        payer: donorEmail ? {
          email_address: donorEmail,
        } : undefined,
        application_context: {
          return_url: `${baseUrl}/campaign/${campaignId}?payment=success`,
          cancel_url: `${baseUrl}/campaign/${campaignId}?payment=cancelled`,
          brand_name: 'Church Management',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('PayPal order creation failed:', error);
      throw new Error('Failed to create PayPal order');
    }

    const order = await orderResponse.json();
    
    // Find the approval URL
    const approvalUrl = order.links?.find((link: { rel: string; href: string }) => link.rel === 'approve')?.href;

    return NextResponse.json({
      orderId: order.id,
      approvalUrl,
      success: true,
    });
  } catch (error) {
    console.error('PayPal checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
